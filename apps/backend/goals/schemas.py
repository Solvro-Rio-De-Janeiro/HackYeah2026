from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from goals.models import AddictionType, GoalPeriod


class CreateGoalRequest(BaseModel):
    group_id: UUID
    foundation_id: UUID
    name: str
    description: str
    saldo: float
    target_price: float
    price: float
    addiction_type: AddictionType  # enum
    period: GoalPeriod  # enum


class FinishGoalRequest(BaseModel):
    id: UUID


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    saldo: float
    target_price: float
    period: GoalPeriod
    challenge_id: UUID
    checkout_urls: list[str] = Field(default_factory=list)
