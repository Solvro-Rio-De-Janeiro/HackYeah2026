from uuid import uuid4

from sqlalchemy import UUID, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base


class Group(Base):
    __tablename__ = "group"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)

    memberships: Mapped[list["UserGroup"]] = relationship(
        back_populates="group", cascade="all, delete-orphan"
    )
    challenges: Mapped[list["Challenge"]] = relationship(back_populates="group")
