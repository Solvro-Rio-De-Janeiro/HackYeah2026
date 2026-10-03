from uuid import uuid4

from sqlalchemy import UUID, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base


class GiftGoal(Base):
    __tablename__ = "gift_goal"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("goal.id"), primary_key=True
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)

    goal: Mapped["Goal"] = relationship(back_populates="gift_goal")
