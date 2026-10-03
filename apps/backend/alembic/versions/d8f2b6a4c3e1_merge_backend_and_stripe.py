"""Merge backend and stripe-init migration heads.

Restores group_member_balance as the table used by the user_group module
and drops group columns that nothing uses.

Revision ID: d8f2b6a4c3e1
Revises: c9e5a3f1d7b4, 02d865bbde85
Create Date: 2026-10-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "d8f2b6a4c3e1"
down_revision: str | Sequence[str] | None = ("c9e5a3f1d7b4", "02d865bbde85")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)

    if "group_member_balance" in inspector.get_view_names():
        op.execute("DROP VIEW group_member_balance")
    if "group_member_balance" not in inspector.get_table_names():
        op.create_table(
            "group_member_balance",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("user_group_id", sa.UUID(), nullable=False),
            sa.Column("balance", sa.Numeric(), nullable=False),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(
                ["user_group_id"],
                ["user_group.id"],
                name="group_member_balance_user_group_id_fkey",
                ondelete="CASCADE",
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("user_group_id"),
        )
        op.execute(
            """
            INSERT INTO group_member_balance (id, user_group_id, balance)
            SELECT gen_random_uuid(), ug.id, COALESCE(SUM(s.collected_pln), 0)
            FROM user_group AS ug
            LEFT JOIN subscription AS s ON s.user_group_id = ug.id
            GROUP BY ug.id
            """
        )

    group_columns = {column["name"] for column in inspector.get_columns("group")}
    for column in ("users", "account_number"):
        if column in group_columns:
            op.drop_column("group", column)


def downgrade() -> None:
    op.add_column(
        "group",
        sa.Column("users", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "group",
        sa.Column(
            "account_number", sa.String(length=34), server_default="", nullable=False
        ),
    )
    op.drop_table("group_member_balance")
    op.execute(
        """
        CREATE VIEW group_member_balance AS
        SELECT user_group_id AS id, SUM(collected_pln)::integer AS balance
        FROM subscription
        GROUP BY user_group_id
        """
    )
