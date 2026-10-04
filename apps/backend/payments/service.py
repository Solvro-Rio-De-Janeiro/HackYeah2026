import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

import stripe
from connect.schemas import BreachPayoutRequest
from connect.service import pay_out_breach
from core.settings import settings
from core.transaction import transaction
from fastapi import HTTPException
from goals.models import Challenge, ChallengeState, Goal, GoalPeriod
from user.models import User, UserRole
from user_group.models import GroupMemberBalance, UserGroup
from payments.models import (
    Payment,
    Subscription,
    SubscriptionInterval,
    SubscriptionStatus,
)
from payments.schemas import CreateSubscriptionRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

logger = logging.getLogger(__name__)

GOAL_PERIOD_INTERVALS = {
    GoalPeriod.DAILY: SubscriptionInterval.DAY,
    GoalPeriod.WEEKLY: SubscriptionInterval.WEEK,
    GoalPeriod.MONTHLY: SubscriptionInterval.MONTH,
}


async def create_subscription_checkout(
    session: AsyncSession, request: CreateSubscriptionRequest, user: User
) -> tuple[Subscription, str]:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured")

    async with transaction(session):
        goal = await session.get(Goal, request.goal_id)
        if goal is None:
            raise HTTPException(status_code=404, detail="Goal not found")
        if (
            not goal.target_price.is_integer()
            or not 2 <= goal.target_price <= 999_999
        ):
            raise HTTPException(
                status_code=409,
                detail="Goal target price must be a whole PLN amount between 2 and 999999",
            )
        amount_pln = int(goal.target_price)

        challenge = await session.get(Challenge, goal.challenge_id)
        if challenge is None or challenge.state != ChallengeState.ACTIVE:
            raise HTTPException(status_code=409, detail="Challenge is not active")

        membership = await session.get(UserGroup, request.user_group_id)
        if membership is None:
            raise HTTPException(status_code=404, detail="Group membership not found")
        if membership.group_id != challenge.group_id:
            raise HTTPException(
                status_code=403,
                detail="Group membership does not belong to the goal's challenge",
            )
        if membership.user_id != user.id and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=403,
                detail="You can only subscribe for your own membership",
            )

        active = await session.scalar(
            select(Subscription.id).where(
                Subscription.user_group_id == membership.id,
                Subscription.goal_id == goal.id,
                Subscription.status == SubscriptionStatus.ACTIVE,
            )
        )
        if active is not None:
            raise HTTPException(
                status_code=409,
                detail="Member already has an active subscription for this goal",
            )

        subscription = Subscription(
            user_group_id=membership.id,
            goal_id=goal.id,
            amount_pln=amount_pln,
            interval=GOAL_PERIOD_INTERVALS[goal.period],
            status=SubscriptionStatus.INCOMPLETE,
        )
        session.add(subscription)
        await session.flush()
        subscription_id = subscription.id
        interval = subscription.interval
        product_name = f"Wspólny cel ({goal.period.value.lower()})"

    metadata = {
        "subscription_id": str(subscription_id),
        "goal_id": str(request.goal_id),
        "user_group_id": str(request.user_group_id),
    }
    frontend_url = settings.frontend_url.rstrip("/")
    try:
        checkout = await run_in_threadpool(
            stripe.checkout.Session.create,
            mode="subscription",
            line_items=[
                {
                    "price_data": {
                        "currency": "pln",
                        "unit_amount": amount_pln * 100,
                        "recurring": {"interval": interval.value},
                        "product_data": {"name": product_name},
                    },
                    "quantity": 1,
                }
            ],
            success_url=(
                f"{frontend_url}/?subscription=success&session_id={{CHECKOUT_SESSION_ID}}"
            ),
            cancel_url=f"{frontend_url}/?subscription=cancelled",
            client_reference_id=str(subscription_id),
            metadata=metadata,
            subscription_data={
                "metadata": metadata,
                **(
                    {"transfer_data": {"destination": goal.collection_stripe_account_id}}
                    if goal.collection_stripe_account_id
                    else {}
                ),
            },
            api_key=settings.stripe_secret_key,
            idempotency_key=f"subscription-checkout-{subscription_id}",
        )
    except stripe.StripeError as error:
        await _cancel_incomplete_subscription(session, subscription_id)
        raise HTTPException(
            status_code=502, detail="Could not create Stripe Checkout session"
        ) from error

    if not checkout.url:
        await _cancel_incomplete_subscription(session, subscription_id)
        raise HTTPException(
            status_code=502, detail="Stripe did not return a Checkout URL"
        )

    async with transaction(session):
        subscription = await session.get(Subscription, subscription_id)
        if subscription is None:
            raise HTTPException(
                status_code=500, detail="Subscription record disappeared"
            )
        subscription.stripe_checkout_session_id = checkout.id
    return subscription, checkout.url


async def process_stripe_webhook(session: AsyncSession, event: stripe.Event) -> None:
    data = event.data.object.to_dict()
    if event.type == "invoice.paid":
        await _process_invoice_paid(session, data)
    elif event.type == "customer.subscription.deleted":
        await _process_subscription_deleted(session, data)
    elif (data.get("metadata") or {}).get("subscription_id"):
        await _process_subscription_checkout(session, event.type, data)


async def _process_subscription_checkout(
    session: AsyncSession, event_type: str, checkout: dict[str, Any]
) -> None:
    subscription_id = _parse_uuid(checkout["metadata"].get("subscription_id"))
    if subscription_id is None:
        return

    async with transaction(session):
        subscription = await session.get(
            Subscription, subscription_id, with_for_update=True
        )
        if subscription is None:
            return
        if event_type == "checkout.session.completed":
            subscription.stripe_checkout_session_id = checkout.get("id")
            subscription.stripe_subscription_id = checkout.get("subscription")
            if subscription.status == SubscriptionStatus.INCOMPLETE:
                subscription.status = SubscriptionStatus.ACTIVE
        elif (
            event_type == "checkout.session.expired"
            and subscription.status == SubscriptionStatus.INCOMPLETE
        ):
            subscription.status = SubscriptionStatus.CANCELED
            subscription.canceled_at = datetime.now(timezone.utc)


async def _process_invoice_paid(session: AsyncSession, invoice: dict[str, Any]) -> None:
    details = (invoice.get("parent") or {}).get("subscription_details") or {}
    subscription_id = _parse_uuid((details.get("metadata") or {}).get("subscription_id"))
    amount_paid = invoice.get("amount_paid") or 0
    if subscription_id is None or amount_paid <= 0:
        return
    if invoice.get("currency") != "pln" or amount_paid % 100:
        return
    net_amount_gr = await _invoice_net_amount(invoice["id"])

    is_first_period = False
    breach_user_group_id: UUID | None = None
    breach_challenge_id: UUID | None = None

    async with transaction(session):
        already_recorded = await session.scalar(
            select(Payment.id).where(Payment.stripe_invoice_id == invoice["id"])
        )
        if already_recorded is not None:
            return

        subscription = await session.get(
            Subscription, subscription_id, with_for_update=True
        )
        if subscription is None:
            return
        goal = await session.get(Goal, subscription.goal_id, with_for_update=True)
        if goal is None:
            return

        is_first_period = subscription.collected_pln == 0

        amount_pln = amount_paid // 100
        session.add(
            Payment(
                subscription_id=subscription.id,
                amount_pln=amount_pln,
                net_amount_gr=net_amount_gr,
                stripe_invoice_id=invoice["id"],
                paid_at=datetime.now(timezone.utc),
            )
        )
        goal.saldo += amount_pln
        subscription.collected_pln += amount_pln
        subscription.collected_net_gr += net_amount_gr
        if subscription.status == SubscriptionStatus.INCOMPLETE:
            subscription.status = SubscriptionStatus.ACTIVE
        if subscription.stripe_subscription_id is None:
            subscription.stripe_subscription_id = details.get("subscription")

        balance = await session.scalar(
            select(GroupMemberBalance)
            .where(GroupMemberBalance.user_group_id == subscription.user_group_id)
            .with_for_update()
        )
        if balance is None:
            session.add(
                GroupMemberBalance(
                    user_group_id=subscription.user_group_id,
                    balance=Decimal(amount_pln),
                )
            )
        else:
            balance.balance += Decimal(amount_pln)
            balance.updated_at = datetime.now(timezone.utc)

        # The period that just ended is validated now, before it is reset:
        # every day in `completions` must be True, or this member breached
        # the challenge for that period.
        if not is_first_period:
            user_group = await session.get(
                UserGroup, subscription.user_group_id, with_for_update=True
            )
            if user_group is not None:
                if not _completions_all_true(user_group.completions):
                    breach_user_group_id = user_group.id
                    breach_challenge_id = goal.challenge_id
                user_group.completions = []

    if breach_user_group_id is not None and breach_challenge_id is not None:
        try:
            await pay_out_breach(
                session,
                BreachPayoutRequest(
                    user_group_id=breach_user_group_id,
                    challenge_id=breach_challenge_id,
                ),
            )
        except HTTPException:
            logger.exception(
                "Addiction validation breach payout failed for user_group %s",
                breach_user_group_id,
            )


def _completions_all_true(completions: list[bool]) -> bool:
    return bool(completions) and all(completions)


async def _process_subscription_deleted(
    session: AsyncSession, stripe_subscription: dict[str, Any]
) -> None:
    async with transaction(session):
        subscription = await session.scalar(
            select(Subscription)
            .where(Subscription.stripe_subscription_id == stripe_subscription["id"])
            .with_for_update()
        )
        if subscription is None or subscription.status == SubscriptionStatus.CANCELED:
            return
        subscription.status = SubscriptionStatus.CANCELED
        subscription.canceled_at = datetime.now(timezone.utc)


async def _cancel_incomplete_subscription(
    session: AsyncSession, subscription_id: UUID
) -> None:
    async with transaction(session):
        subscription = await session.get(
            Subscription, subscription_id, with_for_update=True
        )
        if (
            subscription is not None
            and subscription.status == SubscriptionStatus.INCOMPLETE
        ):
            subscription.status = SubscriptionStatus.CANCELED
            subscription.canceled_at = datetime.now(timezone.utc)


async def _invoice_net_amount(invoice_id: str) -> int:
    """Amount the platform received for an invoice after Stripe fees, in grosze."""
    invoice = await run_in_threadpool(
        stripe.Invoice.retrieve,
        invoice_id,
        expand=["payments.data.payment.payment_intent"],
        api_key=settings.stripe_secret_key,
    )
    net_amount_gr = 0
    for invoice_payment in invoice.to_dict()["payments"]["data"]:
        if invoice_payment.get("status") != "paid":
            continue
        payment_intent = invoice_payment["payment"]["payment_intent"]
        charge = await run_in_threadpool(
            stripe.Charge.retrieve,
            payment_intent["latest_charge"],
            expand=["balance_transaction"],
            api_key=settings.stripe_secret_key,
        )
        balance_transaction = charge.to_dict().get("balance_transaction")
        if not balance_transaction:
            raise RuntimeError(f"Invoice {invoice_id} has no balance transaction yet")
        net_amount_gr += balance_transaction["net"]
    if net_amount_gr <= 0:
        raise RuntimeError(f"Invoice {invoice_id} has no paid payment")
    return net_amount_gr


def _parse_uuid(value: object) -> UUID | None:
    try:
        return UUID(str(value)) if value else None
    except ValueError:
        return None
