from uuid import uuid4

from sqlalchemy import UUID, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base
from .user_role import UserRole


class User(Base):
    __tablename__ = "user"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column("e-mail", Text, nullable=False, unique=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), nullable=False
    )
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    stripe_account_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )

    memberships: Mapped[list["UserGroup"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
