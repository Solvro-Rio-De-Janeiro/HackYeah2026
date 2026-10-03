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
from core.db_config import DBSessionDep
from fastapi import APIRouter

router = APIRouter(tags=["connect"])


@router.post(
    "/foundations/{foundation_id}/onboarding", response_model=OnboardingResponse
)
async def foundation_onboarding(
    foundation_id: UUID, payload: FoundationOnboardingRequest, session: DBSessionDep
) -> OnboardingResponse:
    account_id, url = await start_foundation_onboarding(
        session, foundation_id, payload.contact_email
    )
    return OnboardingResponse(stripe_account_id=account_id, onboarding_url=url)


@router.get("/foundations/{foundation_id}/status", response_model=AccountStatusResponse)
async def foundation_status(
    foundation_id: UUID, session: DBSessionDep
) -> AccountStatusResponse:
    return await get_foundation_account_status(session, foundation_id)


@router.post("/users/{user_id}/onboarding", response_model=OnboardingResponse)
async def user_onboarding(user_id: UUID, session: DBSessionDep) -> OnboardingResponse:
    account_id, url = await start_user_onboarding(session, user_id)
    return OnboardingResponse(stripe_account_id=account_id, onboarding_url=url)


@router.get("/users/{user_id}/status", response_model=AccountStatusResponse)
async def user_status(user_id: UUID, session: DBSessionDep) -> AccountStatusResponse:
    return await get_user_account_status(session, user_id)


@router.post("/payouts/breach", response_model=PayoutResponse)
async def breach_payout(
    payload: BreachPayoutRequest, session: DBSessionDep
) -> PayoutResponse:
    return _payout_response(await pay_out_breach(session, payload))


@router.post("/payouts/goal-purchase", response_model=PayoutResponse)
async def goal_purchase_payout(
    payload: GoalPurchasePayoutRequest, session: DBSessionDep
) -> PayoutResponse:
    return _payout_response(await pay_out_goal_purchase(session, payload))


def _payout_response(payout: Payout) -> PayoutResponse:
    return PayoutResponse(
        payout_id=payout.id,
        kind=payout.kind,
        status=payout.status,
        amount_pln=payout.amount_pln,
        stripe_transfer_id=payout.stripe_transfer_id,
    )
