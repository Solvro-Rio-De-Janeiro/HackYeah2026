from uuid import uuid4

from sqlalchemy import UUID, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base
from .addiction_type import AddictionType
from .challenge_state import ChallengeState


class Challenge(Base):
    __tablename__ = "challenge"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    foundation_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("foundation.id"), nullable=False
    )
    group_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("group.id"), nullable=False
    )
    state: Mapped[ChallengeState] = mapped_column(
        Enum(ChallengeState, name="challenge_state"), nullable=False
    )
    addiction_type: Mapped[AddictionType] = mapped_column(
        Enum(AddictionType, name="addiction_type"), nullable=False
    )

    foundation: Mapped["Foundation"] = relationship(back_populates="challenges")
    group: Mapped["Group"] = relationship(back_populates="challenges")
    goal: Mapped["Goal"] = relationship(
        back_populates="challenge", foreign_keys="Goal.challenge_id"
    )
