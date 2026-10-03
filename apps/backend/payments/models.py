from datetime import datetime
from enum import StrEnum
from uuid import UUID

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
    func,
)
from sqlalchemy.orm import Mapped, mapped_column


class PaymentStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    EXPIRED = "expired"
    FAILED = "failed"


class Payment(Base):
    __tablename__ = "payment"
    __table_args__ = (
        CheckConstraint("amount_pln > 0", name="ck_payment_amount_positive"),
    )

    user_group_id: Mapped[UUID | None] = mapped_column(
        SQLUUID(as_uuid=True), nullable=True
    )
    id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("user_group.id"), primary_key=True
    )
    challenge_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("challenge.id"), nullable=False
    )
    amount_pln: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3), nullable=False, default="pln", server_default="pln"
    )
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(
            PaymentStatus,
            name="payment_status",
            values_callable=lambda statuses: [status.value for status in statuses],
        ),
        nullable=False,
        default=PaymentStatus.PENDING,
    )
    stripe_checkout_session_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))