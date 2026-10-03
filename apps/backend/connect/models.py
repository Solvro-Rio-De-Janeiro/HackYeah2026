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


class PayoutStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class Payout(Base):
    __tablename__ = "payout"
    __table_args__ = (
        CheckConstraint("amount_pln > 0", name="ck_payout_amount_positive"),
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
    amount_pln: Mapped[int] = mapped_column(Integer, nullable=False)
    challenge_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("challenge.id"), nullable=False
    )
    goal_id: Mapped[UUID | None] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("goal.id"), nullable=True
    )

    user_group_id: Mapped[UUID | None] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("user_group.id"), nullable=True
    )
    foundation_id: Mapped[UUID | None] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("foundation.id"), nullable=True
    )

    recipient_user_id: Mapped[UUID | None] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    stripe_destination_account_id: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    stripe_transfer_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
