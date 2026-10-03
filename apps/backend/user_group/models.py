from decimal import Decimal
from uuid import uuid4

from sqlalchemy import UUID, DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base


class UserGroup(Base):
    __tablename__ = "user_group"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    group_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("group.id", ondelete="CASCADE"), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="memberships")
    group: Mapped["Group"] = relationship(back_populates="memberships")
    balance: Mapped["GroupMemberBalance | None"] = relationship(
        back_populates="membership", uselist=False, cascade="all, delete-orphan"
    )


class GroupMemberBalance(Base):
    __tablename__ = "group_member_balance"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_group_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user_group.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    balance: Mapped[Decimal] = mapped_column(Numeric, nullable=False, default=0)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    membership: Mapped[UserGroup] = relationship(back_populates="balance")
