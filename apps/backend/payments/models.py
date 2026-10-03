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
    func,
)
from sqlalchemy.orm import Mapped, mapped_column


class PaymentStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    EXPIRED = "expired"
    FAILED = "failed"


class SubscriptionStatus(StrEnum):
    INCOMPLETE = "incomplete"
    ACTIVE = "active"
    CANCELED = "canceled"


class SubscriptionInterval(StrEnum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"


class Subscription(Base):
    __tablename__ = "subscription"
    __table_args__ = (
        CheckConstraint("amount_pln > 0", name="ck_subscription_amount_positive"),
        CheckConstraint(
            "collected_pln >= 0", name="ck_subscription_collected_non_negative"
        ),
    )

    id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_group_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("user_group.id"), nullable=False
    )
    goal_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("goal.id"), nullable=False
    )
    amount_pln: Mapped[int] = mapped_column(Integer, nullable=False)
    interval: Mapped[SubscriptionInterval] = mapped_column(
        Enum(
            SubscriptionInterval,
            name="subscription_interval",
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
    )

    collected_pln: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(
            SubscriptionStatus,
            name="subscription_status",
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
        default=SubscriptionStatus.INCOMPLETE,
    )
    stripe_checkout_session_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    stripe_subscription_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    canceled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Payment(Base):
    __tablename__ = "payment"
    __table_args__ = (
        CheckConstraint("amount_pln > 0", name="ck_payment_amount_positive"),
    )

    id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_group_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("user_group.id"), nullable=False
    )
    challenge_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("challenge.id"), nullable=False
    )
    subscription_id: Mapped[UUID | None] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("subscription.id"), nullable=True
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
    stripe_invoice_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))