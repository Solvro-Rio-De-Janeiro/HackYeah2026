import stripe
from core.settings import settings
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from goals.goal_repository import GoalRepository
from goals.models import Goal
from goals.schemas import CreateGoalRequest
from payments.models import Subscription, SubscriptionInterval, SubscriptionStatus
from fundation.models import Foundation
from user_group.repository import UserGroupRepository


GOAL_PERIOD_INTERVALS = {
    "daily": SubscriptionInterval.DAY,
    "weekly": SubscriptionInterval.WEEK,
    "monthly": SubscriptionInterval.MONTH,
}


class CreateGoalHandler:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.goal_repository = GoalRepository(self.session)
        self.user_group_repository = UserGroupRepository(session=self.session)

    async def handle(self, request: CreateGoalRequest) -> tuple[Goal, list[str]]:
        user_groups = await self.user_group_repository.get_by_group_id(request.group_id)
        if not user_groups:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found for this group",
            )

        foundation = await self.session.get(Foundation, request.foundation_id)
        if foundation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Foundation not found",
            )

        goal = await self.goal_repository.create(request)

        if (
            not goal.target_price.is_integer()
            or not 2 <= goal.target_price <= 999_999
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Goal target price must be a whole PLN amount between 2 and 999999",
            )

        if not settings.stripe_secret_key:
            raise HTTPException(status_code=503, detail="Stripe is not configured")

        await self.user_group_repository.clear_balances_for_memberships(user_groups)
        subscriptions = [
            Subscription(
                user_group_id=membership.id,
                goal_id=goal.id,
                amount_pln=int(goal.target_price),
                interval=GOAL_PERIOD_INTERVALS[goal.period.value],
                status=SubscriptionStatus.INCOMPLETE,
            )
            for membership in user_groups
        ]
        self.session.add_all(subscriptions)
        await self.session.flush()

        frontend_url = settings.frontend_url.rstrip("/")
        checkout_urls: list[str] = []
        try:
            await self.session.commit()

            for subscription in subscriptions:
                metadata = {
                    "subscription_id": str(subscription.id),
                    "goal_id": str(goal.id),
                    "user_group_id": str(subscription.user_group_id),
                }
                checkout = await run_in_threadpool(
                    stripe.checkout.Session.create,
                    mode="subscription",
                    line_items=[
                        {
                            "price_data": {
                                "currency": "pln",
                                "unit_amount": subscription.amount_pln * 100,
                                "recurring": {"interval": subscription.interval.value},
                                "product_data": {
                                    "name": f"Wspólny cel ({goal.period.value.lower()})"
                                },
                            },
                            "quantity": 1,
                        }
                    ],
                    success_url=f"{frontend_url}/?subscription=success&session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{frontend_url}/?subscription=cancelled",
                    client_reference_id=str(subscription.id),
                    metadata=metadata,
                    subscription_data={
                        "metadata": metadata,
                    },
                    api_key=settings.stripe_secret_key,
                    idempotency_key=f"subscription-checkout-{subscription.id}",
                )
                subscription.stripe_checkout_session_id = checkout.id
                if checkout.url:
                    checkout_urls.append(checkout.url)

            await self.session.commit()
        except (stripe.StripeError, HTTPException) as error:
            await self.session.rollback()
            raise HTTPException(
                status_code=502,
                detail="Could not initialize Stripe Checkout sessions for goal",
            ) from error

        return goal, checkout_urls
