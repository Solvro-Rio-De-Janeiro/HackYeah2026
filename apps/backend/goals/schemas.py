from uuid import UUID
from pydantic import BaseModel, ConfigDict

from goals.models import AddictionType, GoalPeriod


class CreateGoalRequest(BaseModel):
    group_id: UUID
    foundation_id: UUID
    name: str
    description: str
    saldo: float
    price: float
    addiction_type: AddictionType
    period: GoalPeriod


class FinishGoalRequest(BaseModel):
    id: UUID


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    saldo: float
    period: GoalPeriod
    challenge_id: UUID
