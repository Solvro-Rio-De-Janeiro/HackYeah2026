from fastapi import APIRouter, status

from auth.dependencies import CurrentUserDep
from core.db_config import DBSessionDep
from notifications.repository import PushSubscriptionRepository
from notifications.schemas import PushSubscriptionRequest

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/subscriptions", status_code=status.HTTP_204_NO_CONTENT)
async def register_subscription(
    request: PushSubscriptionRequest,
    user: CurrentUserDep,
    session: DBSessionDep,
) -> None:
    await PushSubscriptionRepository(session).upsert(
        user_id=user.id,
        endpoint=str(request.endpoint),
        p256dh=request.keys.p256dh,
        auth=request.keys.auth,
    )
