from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from core.db_config import Base
from sqlalchemy import (
    UUID as SQLUUID,
)
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column


class PayoutKind(StrEnum):
    FOUNDATION_BREACH = "foundation_breach"
    GOAL_PURCHASE = "goal_purchase"
    GOAL_COMPLETION = "goal_completion"


class PayoutStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class Payout(Base):
    __tablename__ = "payout"
    __table_args__ = (
        CheckConstraint("amount_gr > 0", name="ck_payout_amount_positive"),
    )

    id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    kind: Mapped[PayoutKind] = mapped_column(
        Enum(
            PayoutKind,
            name="payout_kind",
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
    )
    status: Mapped[PayoutStatus] = mapped_column(
        Enum(
            PayoutStatus,
            name="payout_status",
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
        default=PayoutStatus.PENDING,
    )
    amount_gr: Mapped[int] = mapped_column(Integer, nullable=False)
    goal_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("goal.id"), nullable=False
    )
    user_group_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("user_group.id"), nullable=False
    )
    stripe_transfer_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
