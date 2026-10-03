"""Add Stripe-backed payments.

Revision ID: 9d8f2a1c6b45
Revises: b3ab8c1f6336
Create Date: 2026-10-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "9d8f2a1c6b45"
down_revision: str | Sequence[str] | None = "b3ab8c1f6336"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


payment_status = postgresql.ENUM(
    "pending", "paid", "expired", "failed", name="payment_status"
)


def upgrade() -> None:
    op.create_table(
        "payment",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("challenge_id", sa.UUID(), nullable=False),
        sa.Column("goal_id", sa.UUID(), nullable=False),
        sa.Column("amount_pln", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), server_default="pln", nullable=False),
        sa.Column("status", payment_status, nullable=False),
        sa.Column("stripe_checkout_session_id", sa.String(length=255), nullable=True),
        sa.Column("stripe_payment_intent_id", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount_pln > 0", name="ck_payment_amount_positive"),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenge.id"]),
        sa.ForeignKeyConstraint(["goal_id"], ["goal.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stripe_checkout_session_id"),
        sa.UniqueConstraint("stripe_payment_intent_id"),
    )


def downgrade() -> None:
    op.drop_table("payment")
    payment_status.drop(op.get_bind(), checkfirst=True)