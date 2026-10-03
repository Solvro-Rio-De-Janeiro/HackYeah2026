import stripe
from core.db_config import DBSessionDep
from core.settings import settings
from fastapi import APIRouter, Header, HTTPException, Request
from payments.schemas import (
    CreateSubscriptionRequest,
    SubscriptionCheckoutResponse,
)
from payments.service import (
    create_subscription_checkout,
    process_stripe_webhook,
)

router = APIRouter(tags=["payments"])


@router.post("/subscriptions", response_model=SubscriptionCheckoutResponse)
async def create_subscription(
    payload: CreateSubscriptionRequest, session: DBSessionDep
) -> SubscriptionCheckoutResponse:
    subscription, checkout_url = await create_subscription_checkout(session, payload)
    return SubscriptionCheckoutResponse(
        subscription_id=subscription.id, checkout_url=checkout_url
    )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    session: DBSessionDep,
    stripe_signature: str = Header(alias="Stripe-Signature"),
) -> dict[str, bool]:
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook is not configured")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.stripe_webhook_secret
        )
    except (ValueError, stripe.SignatureVerificationError) as error:
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook") from error

    await process_stripe_webhook(session, event)
    return {"received": True}