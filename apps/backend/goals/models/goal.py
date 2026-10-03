from uuid import uuid4

from sqlalchemy import UUID, Enum, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base
from .goal_period import GoalPeriod


class Goal(Base):
    __tablename__ = "goal"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    saldo: Mapped[float] = mapped_column(Float, nullable=False)
    period: Mapped[GoalPeriod] = mapped_column(
        Enum(GoalPeriod, name="goal_period"), nullable=False
    )
    challenge_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("challenge.id"), nullable=False, unique=True
    )

    challenge: Mapped["Challenge"] = relationship(
        back_populates="goal", foreign_keys="Goal.challenge_id"
    )
    gift_goal: Mapped["GiftGoal | None"] = relationship(back_populates="goal")
