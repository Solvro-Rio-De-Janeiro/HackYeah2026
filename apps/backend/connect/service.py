from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

import stripe
from connect.models import Payout, PayoutKind, PayoutStatus
from connect.schemas import (
    AccountStatusResponse,
    BreachPayoutRequest,
    GoalPurchasePayoutRequest,
)
from core.settings import settings
from fastapi import HTTPException
from fundation.models import Foundation
from goals.models import Challenge, Goal
from user_group.models import GroupMemberBalance, UserGroup
from payments.models import Subscription, SubscriptionStatus
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool
from user.models import User


def _require_stripe() -> None:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured")


async def start_foundation_onboarding(
    session: AsyncSession, foundation_id: UUID, contact_email: str
) -> tuple[str, str]:
    _require_stripe()
    async with session.begin():
        foundation = await session.get(Foundation, foundation_id, with_for_update=True)
        if foundation is None:
            raise HTTPException(status_code=404, detail="Foundation not found")
        if foundation.stripe_account_id is None:
            account = await _create_account(
                entity_type="non_profit",
                contact_email=contact_email,
                metadata={"foundation_id": str(foundation.id)},
            )
            foundation.stripe_account_id = account.id
        account_id = foundation.stripe_account_id

    return account_id, await _create_onboarding_link(account_id)


async def start_user_onboarding(
    session: AsyncSession, user_id: UUID
) -> tuple[str, str]:
    _require_stripe()
    async with session.begin():
        user = await session.get(User, user_id, with_for_update=True)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        if user.stripe_account_id is None:
            account = await _create_account(
                entity_type="individual",
                contact_email=user.email,
                metadata={"user_id": str(user.id)},
            )
            user.stripe_account_id = account.id
        account_id = user.stripe_account_id

    return account_id, await _create_onboarding_link(account_id)


async def get_foundation_account_status(
    session: AsyncSession, foundation_id: UUID
) -> AccountStatusResponse:
    foundation = await session.get(Foundation, foundation_id)
    if foundation is None:
        raise HTTPException(status_code=404, detail="Foundation not found")
    return await _account_status(foundation.stripe_account_id)


async def get_user_account_status(
    session: AsyncSession, user_id: UUID
) -> AccountStatusResponse:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return await _account_status(user.stripe_account_id)


async def pay_out_breach(
    session: AsyncSession, request: BreachPayoutRequest
) -> list[Payout]:
    """Send a member's held deposits to the challenge's foundation, per goal."""
    _require_stripe()
    payouts: list[Payout] = []
    async with session.begin():
        membership = await session.get(UserGroup, request.user_group_id)
        if membership is None:
            raise HTTPException(status_code=404, detail="Group membership not found")
        challenge = await session.get(
            Challenge, request.challenge_id, with_for_update=True
        )
        if challenge is None:
            raise HTTPException(status_code=404, detail="Challenge not found")
        if membership.group_id != challenge.group_id:
            raise HTTPException(
                status_code=403,
                detail="Group membership does not belong to the challenge",
            )
        foundation = await session.get(Foundation, challenge.foundation_id)
        if foundation is None or foundation.stripe_account_id is None:
            raise HTTPException(
                status_code=409,
                detail="Foundation has no Stripe account; finish onboarding first",
            )

        subscriptions = list(
            await session.scalars(
                select(Subscription)
                .join(Goal, Goal.id == Subscription.goal_id)
                .where(
                    Subscription.user_group_id == membership.id,
                    Goal.challenge_id == challenge.id,
                )
                .with_for_update(of=Subscription)
            )
        )
        by_goal: dict[UUID, list[Subscription]] = {}
        for subscription in subscriptions:
            if subscription.collected_pln > 0:
                by_goal.setdefault(subscription.goal_id, []).append(subscription)
        if not by_goal:
            raise HTTPException(
                status_code=409, detail="Member has no deposits to transfer"
            )

        for goal_id, goal_subscriptions in by_goal.items():
            payout = Payout(
                kind=PayoutKind.FOUNDATION_BREACH,
                amount_gr=sum(s.collected_net_gr for s in goal_subscriptions),
                goal_id=goal_id,
                user_group_id=membership.id,
            )
            payouts.append(payout)
            if not await _transfer(
                session, payout, foundation.stripe_account_id, challenge.id
            ):
                break
            for subscription in goal_subscriptions:
                await _release_subscription_deposit(session, subscription)

    for payout in payouts:
        _raise_if_failed(payout)
    await _cancel_subscriptions(session, subscriptions)
    return payouts


async def pay_out_goal_purchase(
    session: AsyncSession, request: GoalPurchasePayoutRequest
) -> Payout:
    """Send a goal's whole saldo to the member who buys the goal's item."""
    _require_stripe()
    async with session.begin():
        goal = await session.get(Goal, request.goal_id, with_for_update=True)
        if goal is None:
            raise HTTPException(status_code=404, detail="Goal not found")
        challenge = await session.get(Challenge, goal.challenge_id)
        if challenge is None:
            raise HTTPException(status_code=404, detail="Challenge not found")
        recipient = await session.get(User, request.recipient_user_id)
        if recipient is None:
            raise HTTPException(status_code=404, detail="Recipient not found")
        membership_id = await session.scalar(
            select(UserGroup.id).where(
                UserGroup.user_id == recipient.id,
                UserGroup.group_id == challenge.group_id,
            )
        )
        if membership_id is None:
            raise HTTPException(
                status_code=403,
                detail="Recipient is not a member of the goal's group",
            )
        if recipient.stripe_account_id is None:
            raise HTTPException(
                status_code=409,
                detail="Recipient has no Stripe account; finish onboarding first",
            )
        subscriptions = list(
            await session.scalars(
                select(Subscription)
                .where(Subscription.goal_id == goal.id)
                .with_for_update()
            )
        )
        amount_gr = sum(subscription.collected_net_gr for subscription in subscriptions)
        if amount_gr <= 0:
            raise HTTPException(status_code=409, detail="Goal has no funds")

        payout = Payout(
            kind=PayoutKind.GOAL_PURCHASE,
            amount_gr=amount_gr,
            goal_id=goal.id,
            user_group_id=membership_id,
        )
        if await _transfer(session, payout, recipient.stripe_account_id, challenge.id):
            for subscription in subscriptions:
                await _release_subscription_deposit(session, subscription)
            goal.saldo = 0

    _raise_if_failed(payout)
    await _cancel_subscriptions(session, subscriptions)
    return payout


def _stripe_client() -> stripe.StripeClient:
    return stripe.StripeClient(settings.stripe_secret_key)


async def _create_account(
    entity_type: str, contact_email: str, metadata: dict[str, str]
) -> stripe.v2.core.Account:
    """Create an Accounts v2 recipient that can receive transfers."""
    try:
        return await run_in_threadpool(
            _stripe_client().v2.core.accounts.create,
            {
                "contact_email": contact_email,
                "dashboard": "express",
                "identity": {"country": "PL", "entity_type": entity_type},
                "defaults": {
                    "responsibilities": {
                        "fees_collector": "application",
                        "losses_collector": "application",
                    }
                },
                "configuration": {
                    "recipient": {
                        "capabilities": {
                            "stripe_balance": {
                                "stripe_transfers": {"requested": True}
                            }
                        }
                    }
                },
                "metadata": metadata,
            },
        )
    except stripe.StripeError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not create Stripe account: {error.user_message or error}",
        ) from error


async def _create_onboarding_link(account_id: str) -> str:
    frontend_url = settings.frontend_url.rstrip("/")
    try:
        link = await run_in_threadpool(
            _stripe_client().v2.core.account_links.create,
            {
                "account": account_id,
                "use_case": {
                    "type": "account_onboarding",
                    "account_onboarding": {
                        "refresh_url": f"{frontend_url}/?connect=refresh",
                        "return_url": f"{frontend_url}/?connect=done",
                    },
                },
            },
        )
    except stripe.StripeError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not create Stripe onboarding link: {error.user_message or error}",
        ) from error
    return link.url


async def _account_status(account_id: str | None) -> AccountStatusResponse:
    if account_id is None:
        return AccountStatusResponse(
            stripe_account_id=None,
            details_submitted=False,
            transfers_active=False,
            requirements_due=[],
        )
    _require_stripe()
    try:
        account = await run_in_threadpool(
            _stripe_client().v2.core.accounts.retrieve,
            account_id,
            {"include": ["configuration.recipient", "requirements"]},
        )
    except stripe.StripeError as error:
        raise HTTPException(
            status_code=502, detail="Could not read Stripe account"
        ) from error

    data = account.to_dict()
    transfers = (
        ((data.get("configuration") or {}).get("recipient") or {})
        .get("capabilities", {})
        .get("stripe_balance", {})
        .get("stripe_transfers", {})
    )
    requirements_due = [
        entry.get("description") or entry.get("awaiting_action_from") or "unknown"
        for entry in (data.get("requirements") or {}).get("entries") or []
    ]
    return AccountStatusResponse(
        stripe_account_id=account_id,
        details_submitted=not requirements_due,
        transfers_active=transfers.get("status") == "active",
        requirements_due=requirements_due,
    )


async def _transfer(
    session: AsyncSession, payout: Payout, destination: str, challenge_id: UUID
) -> bool:
    """Create the Stripe transfer; records the outcome on the payout."""
    session.add(payout)
    await session.flush()
    try:
        transfer = await run_in_threadpool(
            stripe.Transfer.create,
            amount=payout.amount_gr,
            currency="pln",
            destination=destination,
            transfer_group=f"challenge-{challenge_id}",
            metadata={"payout_id": str(payout.id), "kind": payout.kind.value},
            api_key=settings.stripe_secret_key,
            idempotency_key=f"payout-{payout.id}",
        )
    except stripe.StripeError as error:
        payout.status = PayoutStatus.FAILED
        payout.failure_reason = (
            "Insufficient available Stripe balance"
            if error.code == "balance_insufficient"
            else str(error.user_message or error)
        )
        return False

    payout.stripe_transfer_id = transfer.id
    payout.status = PayoutStatus.PAID
    return True


async def _release_subscription_deposit(
    session: AsyncSession, subscription: Subscription
) -> None:
    """Remove a subscription's held deposits from the goal and member balance."""
    goal = await session.get(Goal, subscription.goal_id, with_for_update=True)
    if goal is not None:
        goal.saldo = max(goal.saldo - subscription.collected_pln, 0)
    balance = await session.scalar(
        select(GroupMemberBalance)
        .where(GroupMemberBalance.user_group_id == subscription.user_group_id)
        .with_for_update()
    )
    if balance is not None:
        balance.balance = max(
            balance.balance - Decimal(subscription.collected_pln), Decimal(0)
        )
        balance.updated_at = datetime.now(timezone.utc)
    subscription.collected_pln = 0
    subscription.collected_net_gr = 0


def _raise_if_failed(payout: Payout) -> None:
    if payout.status == PayoutStatus.FAILED:
        raise HTTPException(
            status_code=409,
            detail=f"Payout {payout.id} failed: {payout.failure_reason}",
        )


async def _cancel_subscriptions(
    session: AsyncSession, subscriptions: list[Subscription]
) -> None:
    stripe_ids = [
        subscription.stripe_subscription_id
        for subscription in subscriptions
        if subscription.status == SubscriptionStatus.ACTIVE
        and subscription.stripe_subscription_id
    ]
    canceled: list[str] = []
    for stripe_id in stripe_ids:
        try:
            await run_in_threadpool(
                stripe.Subscription.cancel,
                stripe_id,
                api_key=settings.stripe_secret_key,
            )
        except stripe.StripeError:
            continue
        canceled.append(stripe_id)

    if not canceled:
        return
    async with session.begin():
        for subscription in await session.scalars(
            select(Subscription).where(Subscription.stripe_subscription_id.in_(canceled))
        ):
            subscription.status = SubscriptionStatus.CANCELED
            subscription.canceled_at = datetime.now(timezone.utc)
