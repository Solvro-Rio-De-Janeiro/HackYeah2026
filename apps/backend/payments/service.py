from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

import stripe
from core.settings import settings
from fastapi import HTTPException
from goals.models import Challenge, ChallengeState, GiftGoal, Goal, GoalPeriod
from group.models import GroupMemberBalance, UserGroup
from payments.models import (
    Payment,
    PaymentStatus,
    Subscription,
    SubscriptionInterval,
    SubscriptionStatus,
)
from payments.schemas import CreateCheckoutSessionRequest, CreateSubscriptionRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

GOAL_PERIOD_INTERVALS = {
    GoalPeriod.DAILY: SubscriptionInterval.DAY,
    GoalPeriod.WEEKLY: SubscriptionInterval.WEEK,
    GoalPeriod.MONTHLY: SubscriptionInterval.MONTH,
}


async def create_checkout_session(
    session: AsyncSession, request: CreateCheckoutSessionRequest
) -> tuple[Payment, str]:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured")

    async with session.begin():
        goal = await session.scalar(
            select(Goal).where(Goal.id == request.goal_id).with_for_update()
        )
        if goal is None:
            raise HTTPException(status_code=404, detail="Goal not found")

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

        gift_goal = await session.get(GiftGoal, goal.id)
        if gift_goal is not None:
            if request.amount_pln is not None:
                raise HTTPException(
                    status_code=422,
                    detail="Gift goals use their fixed price; omit amount_pln",
                )
            amount_pln = gift_goal.price
            product_name = gift_goal.name
        else:
            if request.amount_pln is None:
                raise HTTPException(
                    status_code=422,
                    detail="amount_pln is required for this goal",
                )
            amount_pln = request.amount_pln
            product_name = goal.name

        if amount_pln <= 0:
            raise HTTPException(status_code=409, detail="Goal has no valid price")

        payment = Payment(
            user_group_id=membership.id,
            challenge_id=goal.challenge_id,
            amount_pln=amount_pln,
            currency="pln",
            status=PaymentStatus.PENDING,
        )
        session.add(payment)
        await session.flush()
        payment_id = payment.id
        challenge_id = goal.challenge_id

    frontend_url = settings.frontend_url.rstrip("/")
    try:
        checkout = await run_in_threadpool(
            stripe.checkout.Session.create,
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "pln",
                        "unit_amount": amount_pln * 100,
                        "product_data": {"name": product_name},
                    },
                    "quantity": 1,
                }
            ],
            success_url=(
                f"{frontend_url}/?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
            ),
            cancel_url=f"{frontend_url}/?payment=cancelled",
            client_reference_id=str(payment_id),
            metadata={
                "payment_id": str(payment_id),
                "goal_id": str(request.goal_id),
                "user_group_id": str(membership.id),
                "challenge_id": str(challenge_id),
            },
            api_key=settings.stripe_secret_key,
            idempotency_key=f"payment-checkout-{payment_id}",
        )
    except stripe.StripeError as error:
        await _set_payment_status(session, payment_id, PaymentStatus.FAILED)
        raise HTTPException(
            status_code=502, detail="Could not create Stripe Checkout session"
        ) from error

    if not checkout.url:
        await _set_payment_status(session, payment_id, PaymentStatus.FAILED)
        raise HTTPException(
            status_code=502, detail="Stripe did not return a Checkout URL"
        )

    payment = await session.get(Payment, payment_id)
    if payment is None:
        raise HTTPException(status_code=500, detail="Payment record disappeared")
    payment.stripe_checkout_session_id = checkout.id
    await session.commit()
    return payment, checkout.url


async def create_subscription_checkout(
    session: AsyncSession, request: CreateSubscriptionRequest
) -> tuple[Subscription, str]:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured")

    async with session.begin():
        goal = await session.get(Goal, request.goal_id)
        if goal is None:
            raise HTTPException(status_code=404, detail="Goal not found")

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
            amount_pln=request.amount_pln,
            interval=GOAL_PERIOD_INTERVALS[goal.period],
            status=SubscriptionStatus.INCOMPLETE,
        )
        session.add(subscription)
        await session.flush()
        subscription_id = subscription.id
        interval = subscription.interval
        product_name = goal.name

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
                        "unit_amount": request.amount_pln * 100,
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
            subscription_data={"metadata": metadata},
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

    async with session.begin():
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
    else:
        await _process_payment_checkout(session, event.type, data)


async def _process_payment_checkout(
    session: AsyncSession, event_type: str, checkout: dict[str, Any]
) -> None:
    if event_type not in {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "checkout.session.expired",
    }:
        return

    metadata = checkout.get("metadata") or {}
    payment_id_value = metadata.get("payment_id")
    if not payment_id_value:
        return

    try:
        payment_id = UUID(payment_id_value)
    except (TypeError, ValueError):
        return

    async with session.begin():
        payment = await session.scalar(
            select(Payment).where(Payment.id == payment_id).with_for_update()
        )
        if payment is None:
            return

        checkout_id = checkout.get("id")
        if (
            payment.stripe_checkout_session_id is not None
            and payment.stripe_checkout_session_id != checkout_id
        ):
            return
        payment.stripe_checkout_session_id = checkout_id

        if event_type in {
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded",
        }:
            if payment.status == PaymentStatus.PAID:
                return
            if checkout.get("payment_status") != "paid":
                return
            if (
                checkout.get("currency") != payment.currency
                or checkout.get("amount_total") != payment.amount_pln * 100
            ):
                payment.status = PaymentStatus.FAILED
                return

            try:
                goal_id = UUID(metadata.get("goal_id"))
            except (TypeError, ValueError):
                payment.status = PaymentStatus.FAILED
                return

            goal = await session.get(Goal, goal_id, with_for_update=True)
            if goal is None or goal.challenge_id != payment.challenge_id:
                payment.status = PaymentStatus.FAILED
                return

            goal.saldo += payment.amount_pln
            payment.status = PaymentStatus.PAID
            payment.paid_at = datetime.now(timezone.utc)
            payment_intent = checkout.get("payment_intent")
            if payment_intent:
                payment.stripe_payment_intent_id = str(payment_intent)
            return

        if payment.status != PaymentStatus.PAID:
            payment.status = (
                PaymentStatus.EXPIRED
                if event_type == "checkout.session.expired"
                else PaymentStatus.FAILED
            )


async def _process_subscription_checkout(
    session: AsyncSession, event_type: str, checkout: dict[str, Any]
) -> None:
    subscription_id = _parse_uuid(checkout["metadata"].get("subscription_id"))
    if subscription_id is None:
        return

    async with session.begin():
        subscription = await session.get(
            Subscription, subscription_id, with_for_update=True
        )
        if subscription is None:
            return
        if event_type == "checkout.session.completed":
            subscription.stripe_checkout_session_id = checkout.get("id")
            subscription.stripe_subscription_id = checkout.get("subscription")
            subscription.stripe_customer_id = checkout.get("customer")
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

    async with session.begin():
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

        amount_pln = amount_paid // 100
        session.add(
            Payment(
                user_group_id=subscription.user_group_id,
                challenge_id=goal.challenge_id,
                subscription_id=subscription.id,
                amount_pln=amount_pln,
                currency="pln",
                status=PaymentStatus.PAID,
                stripe_invoice_id=invoice["id"],
                paid_at=datetime.now(timezone.utc),
            )
        )
        goal.saldo += amount_pln
        subscription.collected_pln += amount_pln
        if subscription.status == SubscriptionStatus.INCOMPLETE:
            subscription.status = SubscriptionStatus.ACTIVE
        if subscription.stripe_subscription_id is None:
            subscription.stripe_subscription_id = details.get("subscription")

        balance = await session.get(
            GroupMemberBalance, subscription.user_group_id, with_for_update=True
        )
        if balance is None:
            session.add(
                GroupMemberBalance(
                    id=subscription.user_group_id, balance=Decimal(amount_pln)
                )
            )
        else:
            balance.balance += Decimal(amount_pln)
            balance.updated_at = datetime.now(timezone.utc)


async def _process_subscription_deleted(
    session: AsyncSession, stripe_subscription: dict[str, Any]
) -> None:
    async with session.begin():
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
    async with session.begin():
        subscription = await session.get(
            Subscription, subscription_id, with_for_update=True
        )
        if (
            subscription is not None
            and subscription.status == SubscriptionStatus.INCOMPLETE
        ):
            subscription.status = SubscriptionStatus.CANCELED
            subscription.canceled_at = datetime.now(timezone.utc)


def _parse_uuid(value: object) -> UUID | None:
    try:
        return UUID(str(value)) if value else None
    except ValueError:
        return None


async def _set_payment_status(
    session: AsyncSession, payment_id: UUID, status: PaymentStatus
) -> None:
    async with session.begin():
        payment = await session.get(Payment, payment_id, with_for_update=True)
        if payment is not None and payment.status == PaymentStatus.PENDING:
            payment.status = status