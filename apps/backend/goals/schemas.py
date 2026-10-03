from uuid import UUID
from pydantic import BaseModel

from goals.models import AddictionType, GoalPeriod


class CreateGoalRequest(BaseModel):
    group_id: UUID
    foundation_id: UUID
    name: str
    description: str
    saldo: float
    price: float
    addiction_type: AddictionType  # enum
    period: GoalPeriod  # enum
