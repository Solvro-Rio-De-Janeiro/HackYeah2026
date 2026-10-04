from uuid import uuid4

from sqlalchemy import UUID, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db_config import Base


class PushSubscription(Base):
    __tablename__ = "push_subscription"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    endpoint: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    p256dh: Mapped[str] = mapped_column(Text, nullable=False)
    auth: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["User"] = relationship(back_populates="push_subscriptions")
