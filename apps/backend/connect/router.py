from uuid import UUID

from connect.models import Payout
from connect.schemas import (
    AccountStatusResponse,
    BreachPayoutRequest,
    FoundationOnboardingRequest,
    GoalPurchasePayoutRequest,
    OnboardingResponse,
    PayoutResponse,
)
from connect.service import (
    get_foundation_account_status,
    get_user_account_status,
    pay_out_breach,
    pay_out_goal_purchase,
    start_foundation_onboarding,
    start_user_onboarding,
)
from auth.dependencies import AdminDep, CurrentUserDep
from core.db_config import DBSessionDep
from fastapi import APIRouter, HTTPException
from user.models import User, UserRole

router = APIRouter(tags=["connect"])


@router.post(
    "/foundations/{foundation_id}/onboarding", response_model=OnboardingResponse
)
async def foundation_onboarding(
    foundation_id: UUID,
    payload: FoundationOnboardingRequest,
    session: DBSessionDep,
) -> OnboardingResponse:
    account_id, url = await start_foundation_onboarding(
        session, foundation_id, payload.contact_email
    )
    return OnboardingResponse(stripe_account_id=account_id, onboarding_url=url)



@router.post("/users/{user_id}/onboarding", response_model=OnboardingResponse)
async def user_onboarding(
    user_id: UUID, session: DBSessionDep, user: CurrentUserDep
) -> OnboardingResponse:
    account_id, url = await start_user_onboarding(session, user_id)
    return OnboardingResponse(stripe_account_id=account_id, onboarding_url=url)





def _require_self_or_admin(user: User, user_id: UUID) -> None:
    if user.id != user_id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
