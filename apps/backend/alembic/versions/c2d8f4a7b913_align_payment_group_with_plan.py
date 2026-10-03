"""Align payment and group tables with the database plan.

Revision ID: c2d8f4a7b913
Revises: a7c4e91d2f60
Create Date: 2026-10-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c2d8f4a7b913"
down_revision: str | Sequence[str] | None = "a7c4e91d2f60"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _foreign_key_name(table: str, column: str) -> str | None:
    return next(
        (
            foreign_key["name"]
            for foreign_key in sa.inspect(op.get_bind()).get_foreign_keys(table)
            if foreign_key["constrained_columns"] == [column]
        ),
        None,
    )


def upgrade() -> None:
    connection = op.get_bind()
    if connection.execute(sa.text("SELECT COUNT(*) FROM payment")).scalar_one():
        raise RuntimeError("payment must be empty: payment.id becomes user_group.id")
    if connection.execute(sa.text('SELECT COUNT(*) FROM "group"')).scalar_one():
        raise RuntimeError("group must be empty: users and account_number are required")

    for column in ("user_group_id", "user_id", "goal_id"):
        name = _foreign_key_name("payment", column)
        if name is not None:
            op.drop_constraint(name, "payment", type_="foreignkey")
    op.drop_column("payment", "user_id")
    op.drop_column("payment", "goal_id")
    op.create_foreign_key(
        "payment_id_fkey", "payment", "user_group", ["id"], ["id"]
    )

    op.alter_column("payment", "user_group_id", nullable=True)

    op.add_column("group", sa.Column("users", sa.Integer(), nullable=False))
    op.add_column(
        "group", sa.Column("account_number", sa.String(length=34), nullable=False)
    )


    if connection.execute(
        sa.text("SELECT COUNT(*) FROM group_member_balance")
    ).scalar_one():
        raise RuntimeError(
            "group_member_balance must be empty: its id becomes user_group.id"
        )
    op.alter_column(
        "group_member_balance",
        "balance",
        type_=sa.Numeric(8, 2),
        existing_nullable=False,
    )
    op.create_foreign_key(
        "group_member_balance_id_fkey",
        "group_member_balance",
        "user_group",
        ["id"],
        ["id"],
    )


def downgrade() -> None:
    balance_fk = _foreign_key_name("group_member_balance", "id")
    if balance_fk is not None:
        op.drop_constraint(balance_fk, "group_member_balance", type_="foreignkey")
    op.alter_column(
        "group_member_balance",
        "balance",
        type_=sa.Numeric(),
        existing_nullable=False,
    )

    op.drop_column("group", "account_number")
    op.drop_column("group", "users")

    op.alter_column("payment", "user_group_id", nullable=False)
    op.drop_constraint("payment_id_fkey", "payment", type_="foreignkey")
    op.add_column("payment", sa.Column("goal_id", sa.UUID(), nullable=False))
    op.add_column("payment", sa.Column("user_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        "payment_goal_id_fkey", "payment", "goal", ["goal_id"], ["id"]
    )
    op.create_foreign_key(
        "payment_user_id_fkey", "payment", "user", ["user_id"], ["id"]
    )
    op.create_foreign_key(
        "payment_user_group_id_fkey",
        "payment",
        "user_group",
        ["user_group_id"],
        ["id"],
    )
