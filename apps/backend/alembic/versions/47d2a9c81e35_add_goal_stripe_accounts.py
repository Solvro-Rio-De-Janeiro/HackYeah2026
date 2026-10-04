"""Add Stripe recipient accounts to goals.

Revision ID: 47d2a9c81e35
Revises: 365019f95b2d, a71c4d98e203
Create Date: 2026-10-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "47d2a9c81e35"
down_revision: str | Sequence[str] | None = ("365019f95b2d", "a71c4d98e203")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "goal", sa.Column("collection_stripe_account_id", sa.String(255), nullable=True)
    )
    op.add_column(
        "goal", sa.Column("completion_stripe_account_id", sa.String(255), nullable=True)
    )
    op.create_unique_constraint(
        "uq_goal_collection_stripe_account_id", "goal", ["collection_stripe_account_id"]
    )
    op.create_unique_constraint(
        "uq_goal_completion_stripe_account_id", "goal", ["completion_stripe_account_id"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_goal_completion_stripe_account_id", "goal", type_="unique")
    op.drop_constraint("uq_goal_collection_stripe_account_id", "goal", type_="unique")
    op.drop_column("goal", "completion_stripe_account_id")
    op.drop_column("goal", "collection_stripe_account_id")
