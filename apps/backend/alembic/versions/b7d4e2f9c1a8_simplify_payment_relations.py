"""Simplify payment, subscription and payout relations.

payment keeps only its subscription, payout keeps only its goal and member,
and group_member_balance becomes a view over subscription.collected_pln.

Revision ID: b7d4e2f9c1a8
Revises: f3a9c1d5e7b2
Create Date: 2026-10-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b7d4e2f9c1a8"
down_revision: str | Sequence[str] | None = "f3a9c1d5e7b2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


payment_status = postgresql.ENUM(
    "pending", "paid", "expired", "failed", name="payment_status"
)

BALANCE_VIEW = """
CREATE VIEW group_member_balance AS
SELECT user_group_id AS id, SUM(collected_pln)::integer AS balance
FROM subscription
GROUP BY user_group_id
"""


def upgrade() -> None:
    connection = op.get_bind()

    connection.execute(
        sa.text(
            "DELETE FROM payment "
            "WHERE subscription_id IS NULL OR stripe_invoice_id IS NULL"
        )
    )
    connection.execute(
        sa.text("UPDATE payment SET paid_at = created_at WHERE paid_at IS NULL")
    )
    op.drop_constraint("payment_user_group_id_fkey", "payment", type_="foreignkey")
    op.drop_constraint("payment_challenge_id_fkey", "payment", type_="foreignkey")
    op.drop_constraint(
        "payment_stripe_checkout_session_id_key", "payment", type_="unique"
    )
    op.drop_constraint(
        "payment_stripe_payment_intent_id_key", "payment", type_="unique"
    )
    for column in (
        "user_group_id",
        "challenge_id",
        "currency",
        "status",
        "stripe_checkout_session_id",
        "stripe_payment_intent_id",
        "created_at",
    ):
        op.drop_column("payment", column)
    payment_status.drop(connection, checkfirst=True)
    op.alter_column("payment", "subscription_id", nullable=False)
    op.alter_column("payment", "stripe_invoice_id", nullable=False)
    op.alter_column("payment", "paid_at", nullable=False)

    op.drop_column("subscription", "stripe_customer_id")

    connection.execute(
        sa.text(
            """
            UPDATE payout AS p
            SET user_group_id = ug.id
            FROM challenge AS c, user_group AS ug
            WHERE p.user_group_id IS NULL
              AND c.id = p.challenge_id
              AND ug.group_id = c.group_id
              AND ug.user_id = p.recipient_user_id
            """
        )
    )
    connection.execute(
        sa.text(
            """
            UPDATE payout AS p
            SET goal_id = (
                SELECT s.goal_id
                FROM subscription AS s
                JOIN goal AS g ON g.id = s.goal_id
                WHERE s.user_group_id = p.user_group_id
                  AND g.challenge_id = p.challenge_id
                LIMIT 1
            )
            WHERE p.goal_id IS NULL
            """
        )
    )
    if connection.execute(
        sa.text(
            "SELECT COUNT(*) FROM payout "
            "WHERE goal_id IS NULL OR user_group_id IS NULL"
        )
    ).scalar_one():
        raise RuntimeError("Some payouts cannot be linked to a goal and member")
    op.drop_constraint("payout_challenge_id_fkey", "payout", type_="foreignkey")
    op.drop_constraint("payout_foundation_id_fkey", "payout", type_="foreignkey")
    op.drop_constraint("payout_recipient_user_id_fkey", "payout", type_="foreignkey")
    for column in (
        "challenge_id",
        "foundation_id",
        "recipient_user_id",
        "stripe_destination_account_id",
        "paid_at",
    ):
        op.drop_column("payout", column)
    op.alter_column("payout", "goal_id", nullable=False)
    op.alter_column("payout", "user_group_id", nullable=False)

    op.drop_table("group_member_balance")
    op.execute(BALANCE_VIEW)


def downgrade() -> None:
    connection = op.get_bind()

    op.execute("DROP VIEW group_member_balance")
    op.create_table(
        "group_member_balance",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("balance", sa.Numeric(8, 2), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["id"], ["user_group.id"], name="group_member_balance_id_fkey"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    connection.execute(
        sa.text(
            "INSERT INTO group_member_balance (id, balance) "
            "SELECT user_group_id, SUM(collected_pln) FROM subscription "
            "GROUP BY user_group_id"
        )
    )

    op.alter_column("payout", "goal_id", nullable=True)
    op.alter_column("payout", "user_group_id", nullable=True)
    op.add_column("payout", sa.Column("paid_at", sa.DateTime(timezone=True)))
    op.add_column(
        "payout", sa.Column("stripe_destination_account_id", sa.String(length=255))
    )
    op.add_column("payout", sa.Column("recipient_user_id", sa.UUID()))
    op.add_column("payout", sa.Column("foundation_id", sa.UUID()))
    op.add_column("payout", sa.Column("challenge_id", sa.UUID()))
    connection.execute(
        sa.text(
            """
            UPDATE payout AS p
            SET challenge_id = g.challenge_id,
                paid_at = CASE WHEN p.status = 'paid' THEN p.created_at END
            FROM goal AS g
            WHERE g.id = p.goal_id
            """
        )
    )
    connection.execute(
        sa.text(
            """
            UPDATE payout AS p
            SET foundation_id = f.id, stripe_destination_account_id = f.stripe_account_id
            FROM challenge AS c, foundation AS f
            WHERE p.kind = 'foundation_breach'
              AND c.id = p.challenge_id
              AND f.id = c.foundation_id
            """
        )
    )
    connection.execute(
        sa.text(
            """
            UPDATE payout AS p
            SET recipient_user_id = u.id, stripe_destination_account_id = u.stripe_account_id
            FROM user_group AS ug, "user" AS u
            WHERE p.kind = 'goal_purchase'
              AND ug.id = p.user_group_id
              AND u.id = ug.user_id
            """
        )
    )
    connection.execute(
        sa.text(
            "UPDATE payout SET stripe_destination_account_id = '' "
            "WHERE stripe_destination_account_id IS NULL"
        )
    )
    op.alter_column("payout", "challenge_id", nullable=False)
    op.alter_column("payout", "stripe_destination_account_id", nullable=False)
    op.create_foreign_key(
        "payout_challenge_id_fkey", "payout", "challenge", ["challenge_id"], ["id"]
    )
    op.create_foreign_key(
        "payout_foundation_id_fkey", "payout", "foundation", ["foundation_id"], ["id"]
    )
    op.create_foreign_key(
        "payout_recipient_user_id_fkey",
        "payout",
        "user",
        ["recipient_user_id"],
        ["id"],
    )

    op.add_column(
        "subscription", sa.Column("stripe_customer_id", sa.String(length=255))
    )

    payment_status.create(connection, checkfirst=True)
    op.alter_column("payment", "subscription_id", nullable=True)
    op.alter_column("payment", "stripe_invoice_id", nullable=True)
    op.alter_column("payment", "paid_at", nullable=True)
    op.add_column(
        "payment",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.add_column(
        "payment", sa.Column("stripe_payment_intent_id", sa.String(length=255))
    )
    op.add_column(
        "payment", sa.Column("stripe_checkout_session_id", sa.String(length=255))
    )
    op.add_column(
        "payment",
        sa.Column("status", payment_status, server_default="paid", nullable=False),
    )
    op.alter_column("payment", "status", server_default=None)
    op.add_column(
        "payment",
        sa.Column(
            "currency", sa.String(length=3), server_default="pln", nullable=False
        ),
    )
    op.add_column("payment", sa.Column("challenge_id", sa.UUID()))
    op.add_column("payment", sa.Column("user_group_id", sa.UUID()))
    connection.execute(
        sa.text(
            """
            UPDATE payment AS p
            SET user_group_id = s.user_group_id, challenge_id = g.challenge_id
            FROM subscription AS s, goal AS g
            WHERE s.id = p.subscription_id AND g.id = s.goal_id
            """
        )
    )
    op.alter_column("payment", "user_group_id", nullable=False)
    op.alter_column("payment", "challenge_id", nullable=False)
    op.create_unique_constraint(
        "payment_stripe_checkout_session_id_key",
        "payment",
        ["stripe_checkout_session_id"],
    )
    op.create_unique_constraint(
        "payment_stripe_payment_intent_id_key",
        "payment",
        ["stripe_payment_intent_id"],
    )
    op.create_foreign_key(
        "payment_challenge_id_fkey", "payment", "challenge", ["challenge_id"], ["id"]
    )
    op.create_foreign_key(
        "payment_user_group_id_fkey",
        "payment",
        "user_group",
        ["user_group_id"],
        ["id"],
    )
