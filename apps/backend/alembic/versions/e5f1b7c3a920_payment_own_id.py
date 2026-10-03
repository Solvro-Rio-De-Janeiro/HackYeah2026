"""Give payment its own id and link it to user_group via user_group_id.

Revision ID: e5f1b7c3a920
Revises: c2d8f4a7b913
Create Date: 2026-10-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "e5f1b7c3a920"
down_revision: str | Sequence[str] | None = "c2d8f4a7b913"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    connection = op.get_bind()
    if connection.execute(
        sa.text("SELECT COUNT(*) FROM payment WHERE user_group_id IS NULL")
    ).scalar_one():
        raise RuntimeError("payment.user_group_id must be set before it is required")

    op.drop_constraint("payment_id_fkey", "payment", type_="foreignkey")
    op.alter_column("payment", "user_group_id", nullable=False)
    op.create_foreign_key(
        "payment_user_group_id_fkey",
        "payment",
        "user_group",
        ["user_group_id"],
        ["id"],
    )


def downgrade() -> None:
    connection = op.get_bind()
    if connection.execute(
        sa.text("SELECT COUNT(*) FROM payment WHERE id <> user_group_id")
    ).scalar_one():
        raise RuntimeError("payment.id must equal user_group_id to restore the old link")

    op.drop_constraint("payment_user_group_id_fkey", "payment", type_="foreignkey")
    op.alter_column("payment", "user_group_id", nullable=True)
    op.create_foreign_key(
        "payment_id_fkey", "payment", "user_group", ["id"], ["id"]
    )
