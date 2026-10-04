"""Merge goal account and payout migration heads.

Revision ID: 5b6c7d8e9f10
Revises: 47d2a9c81e35, a61c9d7e2f40
Create Date: 2026-10-04
"""

from collections.abc import Sequence

revision: str = "5b6c7d8e9f10"
down_revision: str | Sequence[str] | None = (
    "47d2a9c81e35",
    "a61c9d7e2f40",
)
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
