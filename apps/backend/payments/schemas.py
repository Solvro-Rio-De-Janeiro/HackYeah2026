from uuid import UUID

from pydantic import BaseModel


class CreateSubscriptionRequest(BaseModel):
    goal_id: UUID
    user_group_id: UUID


class SubscriptionCheckoutResponse(BaseModel):
    subscription_id: UUID
    checkout_url: str
