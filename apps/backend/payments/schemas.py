from uuid import UUID

from pydantic import BaseModel, Field


class CreateCheckoutSessionRequest(BaseModel):
    goal_id: UUID
    user_group_id: UUID
    amount_pln: int | None = Field(default=None, ge=1, le=999_999)


class CheckoutSessionResponse(BaseModel):
    payment_id: UUID
    checkout_url: str