from uuid import UUID
from pydantic import BaseModel


class CreateGoalRequest(BaseModel):
    group_id: UUID
    foundation_id: UUID
    name: str
    saldo: float
    addiction_type: str  # enum
    period: str  # enum
