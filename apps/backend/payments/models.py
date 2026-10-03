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
        CheckConstraint(
            "collected_net_gr >= 0",
            name="ck_subscription_collected_net_non_negative",
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
    collected_net_gr: Mapped[int] = mapped_column(
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    canceled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Payment(Base):
    __tablename__ = "payment"
    __table_args__ = (
        CheckConstraint("amount_pln > 0", name="ck_payment_amount_positive"),
        CheckConstraint("net_amount_gr > 0", name="ck_payment_net_amount_positive"),
    )

    id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), primary_key=True, default=uuid4
    )
    subscription_id: Mapped[UUID] = mapped_column(
        SQLUUID(as_uuid=True), ForeignKey("subscription.id"), nullable=False
    )
    amount_pln: Mapped[int] = mapped_column(Integer, nullable=False)
    net_amount_gr: Mapped[int] = mapped_column(Integer, nullable=False)
    stripe_invoice_id: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True
    )
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
