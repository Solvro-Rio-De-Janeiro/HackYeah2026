"""Add target price to goals.

Revision ID: f6a2c8d1e904
Revises: e5f1b7c3a920
Create Date: 2026-10-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "f6a2c8d1e904"
down_revision: str | Sequence[str] | None = "e5f1b7c3a920"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("goal", sa.Column("target_price", sa.Float(), nullable=True))
    op.execute("UPDATE goal SET target_price = 0 WHERE target_price IS NULL")
    op.alter_column("goal", "target_price", nullable=False)


def downgrade() -> None:
    op.drop_column("goal", "target_price")
