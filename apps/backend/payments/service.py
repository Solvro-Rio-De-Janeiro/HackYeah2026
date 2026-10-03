from datetime import datetime, timezone
from uuid import UUID

import stripe
from core.settings import settings
from fastapi import HTTPException
from goals.models import Challenge, ChallengeState, GiftGoal, Goal
from group.models import UserGroup
from payments.models import Payment, PaymentStatus
from payments.schemas import CreateCheckoutSessionRequest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool


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

        if await session.get(Payment, membership.id) is not None:
            raise HTTPException(
                status_code=409,
                detail="Payment already exists for this group membership",
            )

        payment = Payment(
            id=membership.id,
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


async def process_checkout_webhook(
    session: AsyncSession, event: stripe.Event
) -> None:
    event_type = event.type
    if event_type not in {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "checkout.session.expired",
    }:
        return

    checkout = event.data.object
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


async def _set_payment_status(
    session: AsyncSession, payment_id: UUID, status: PaymentStatus
) -> None:
    async with session.begin():
        payment = await session.get(Payment, payment_id, with_for_update=True)
        if payment is not None and payment.status == PaymentStatus.PENDING:
            payment.status = status