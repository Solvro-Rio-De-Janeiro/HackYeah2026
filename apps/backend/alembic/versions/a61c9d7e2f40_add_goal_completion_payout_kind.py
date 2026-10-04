"""Add goal completion payout kind.

Revision ID: a61c9d7e2f40
Revises: 4be128b870ed
Create Date: 2026-10-04
"""

from collections.abc import Sequence

from alembic import op

revision: str = "a61c9d7e2f40"
down_revision: str | Sequence[str] | None = "4be128b870ed"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE payout_kind ADD VALUE IF NOT EXISTS 'goal_completion'")


def downgrade() -> None:
    # PostgreSQL cannot remove an enum value without recreating the type.
    pass
