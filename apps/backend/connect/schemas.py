from uuid import UUID

from connect.models import PayoutKind, PayoutStatus
from pydantic import BaseModel


class FoundationOnboardingRequest(BaseModel):
    contact_email: str


class OnboardingResponse(BaseModel):
    stripe_account_id: str
    onboarding_url: str


class AccountStatusResponse(BaseModel):
    stripe_account_id: str | None
    details_submitted: bool
    transfers_active: bool
    requirements_due: list[str]


class BreachPayoutRequest(BaseModel):
    user_group_id: UUID
    challenge_id: UUID


class GoalPurchasePayoutRequest(BaseModel):
    goal_id: UUID
    recipient_user_id: UUID


class PayoutResponse(BaseModel):
    payout_id: UUID
    kind: PayoutKind
    goal_id: UUID
    status: PayoutStatus
    amount_gr: int
    stripe_transfer_id: str | None
