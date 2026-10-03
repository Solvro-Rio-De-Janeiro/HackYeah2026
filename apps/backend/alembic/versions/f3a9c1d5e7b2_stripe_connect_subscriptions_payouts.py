"""Add Stripe subscriptions, Connect accounts and payouts.

Revision ID: f3a9c1d5e7b2
Revises: e5f1b7c3a920
Create Date: 2026-10-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "f3a9c1d5e7b2"
down_revision: str | Sequence[str] | None = "e5f1b7c3a920"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


payout_kind = postgresql.ENUM(
    "foundation_breach", "goal_purchase", name="payout_kind"
)
payout_status = postgresql.ENUM("pending", "paid", "failed", name="payout_status")
subscription_interval = postgresql.ENUM(
    "day", "week", "month", name="subscription_interval"
)
subscription_status = postgresql.ENUM(
    "incomplete", "active", "canceled", name="subscription_status"
)


def upgrade() -> None:
    op.create_table(
        "subscription",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_group_id", sa.UUID(), nullable=False),
        sa.Column("goal_id", sa.UUID(), nullable=False),
        sa.Column("amount_pln", sa.Integer(), nullable=False),
        sa.Column("interval", subscription_interval, nullable=False),
        sa.Column("collected_pln", sa.Integer(), server_default="0", nullable=False),
        sa.Column("status", subscription_status, nullable=False),
        sa.Column("stripe_checkout_session_id", sa.String(length=255), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(length=255), nullable=True),
        sa.Column("stripe_customer_id", sa.String(length=255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("canceled_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount_pln > 0", name="ck_subscription_amount_positive"),
        sa.CheckConstraint(
            "collected_pln >= 0", name="ck_subscription_collected_non_negative"
        ),
        sa.ForeignKeyConstraint(["goal_id"], ["goal.id"]),
        sa.ForeignKeyConstraint(["user_group_id"], ["user_group.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stripe_checkout_session_id"),
        sa.UniqueConstraint("stripe_subscription_id"),
    )
    op.create_table(
        "payout",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("kind", payout_kind, nullable=False),
        sa.Column("status", payout_status, nullable=False),
        sa.Column("amount_pln", sa.Integer(), nullable=False),
        sa.Column("challenge_id", sa.UUID(), nullable=False),
        sa.Column("goal_id", sa.UUID(), nullable=True),
        sa.Column("user_group_id", sa.UUID(), nullable=True),
        sa.Column("foundation_id", sa.UUID(), nullable=True),
        sa.Column("recipient_user_id", sa.UUID(), nullable=True),
        sa.Column(
            "stripe_destination_account_id", sa.String(length=255), nullable=False
        ),
        sa.Column("stripe_transfer_id", sa.String(length=255), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount_pln > 0", name="ck_payout_amount_positive"),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenge.id"]),
        sa.ForeignKeyConstraint(["foundation_id"], ["foundation.id"]),
        sa.ForeignKeyConstraint(["goal_id"], ["goal.id"]),
        sa.ForeignKeyConstraint(["recipient_user_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["user_group_id"], ["user_group.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stripe_transfer_id"),
    )

    op.add_column(
        "foundation",
        sa.Column("stripe_account_id", sa.String(length=255), nullable=True),
    )
    op.create_unique_constraint(
        "foundation_stripe_account_id_key", "foundation", ["stripe_account_id"]
    )
    op.add_column(
        "user", sa.Column("stripe_account_id", sa.String(length=255), nullable=True)
    )
    op.create_unique_constraint(
        "user_stripe_account_id_key", "user", ["stripe_account_id"]
    )

    op.add_column("payment", sa.Column("subscription_id", sa.UUID(), nullable=True))
    op.add_column(
        "payment",
        sa.Column("stripe_invoice_id", sa.String(length=255), nullable=True),
    )
    op.create_unique_constraint(
        "payment_stripe_invoice_id_key", "payment", ["stripe_invoice_id"]
    )
    op.create_foreign_key(
        "payment_subscription_id_fkey",
        "payment",
        "subscription",
        ["subscription_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("payment_subscription_id_fkey", "payment", type_="foreignkey")
    op.drop_constraint("payment_stripe_invoice_id_key", "payment", type_="unique")
    op.drop_column("payment", "stripe_invoice_id")
    op.drop_column("payment", "subscription_id")

    op.drop_constraint("user_stripe_account_id_key", "user", type_="unique")
    op.drop_column("user", "stripe_account_id")
    op.drop_constraint(
        "foundation_stripe_account_id_key", "foundation", type_="unique"
    )
    op.drop_column("foundation", "stripe_account_id")

    op.drop_table("payout")
    op.drop_table("subscription")
    bind = op.get_bind()
    for enum in (
        payout_kind,
        payout_status,
        subscription_interval,
        subscription_status,
    ):
        enum.drop(bind, checkfirst=True)
