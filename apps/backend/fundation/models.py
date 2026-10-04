from uuid import uuid4

from sqlalchemy import UUID, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base


class Foundation(Base):
    __tablename__ = "foundation"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    stripe_account_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, unique=True
    )

    challenges: Mapped[list["Challenge"]] = relationship(back_populates="foundation")
