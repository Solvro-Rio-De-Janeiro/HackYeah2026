from decimal import Decimal
from uuid import uuid4

from sqlalchemy import UUID, DateTime, ForeignKey, Numeric, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base


class Group(Base):
    __tablename__ = "group"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)

    memberships: Mapped[list["UserGroup"]] = relationship(back_populates="group")
    challenges: Mapped[list["Challenge"]] = relationship(back_populates="group")


class UserGroup(Base):
    __tablename__ = "user_group"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=False
    )
    group_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("group.id"), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="memberships")
    group: Mapped[Group] = relationship(back_populates="memberships")


class GroupMemberBalance(Base):
    __tablename__ = "group_member_balance"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    balance: Mapped[Decimal] = mapped_column(Numeric, nullable=False, default=0)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
