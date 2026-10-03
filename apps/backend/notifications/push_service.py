import asyncio
import json
import logging
from uuid import UUID

from pywebpush import WebPushException, webpush
from sqlalchemy.ext.asyncio import AsyncSession

from core.settings import settings
from notifications.repository import PushSubscriptionRepository

logger = logging.getLogger(__name__)


def send_push(subscription: dict, payload: str) -> int | None:
    try:
        webpush(
            subscription_info=subscription,
            data=payload,
            vapid_private_key=settings.vapid_private_key,
            vapid_claims={"sub": settings.vapid_subject},
        )
        return None
    except WebPushException as exc:
        return getattr(getattr(exc, "response", None), "status_code", None)



async def send_daily_push(session: AsyncSession) -> None:
    if not settings.vapid_private_key:
        logger.warning("VAPID_PRIVATE_KEY is not configured; skipping push")
        return

    repository = PushSubscriptionRepository(session)
    subscriptions = await repository.get_for_active_groups()
    payload = json.dumps({
        "type": "daily_reminder",
        "title": "Czas na dzisiejsze zadanie",
        "body": "Sprawdź swoje aktywne grupy i zrealizuj dzisiejszy cel.",
    })

    for subscription in subscriptions:
        info = {
            "endpoint": subscription.endpoint,
            "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth},
        }
        try:
            status_code = await asyncio.to_thread(send_push, info, payload)
            if status_code in (404, 410):
                await repository.delete(subscription.id)
            elif status_code is not None:
                logger.warning(
                    "Push failed for subscription %s: HTTP %s",
                    subscription.id,
                    status_code,
                )
        except Exception:
            logger.exception("Push failed for subscription %s", subscription.id)
