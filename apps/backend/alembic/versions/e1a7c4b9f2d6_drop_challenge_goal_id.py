"""Drop challenge.goal_id.

goal.challenge_id (unique) already links a goal to its challenge. The extra
required challenge.goal_id made the two tables reference each other with
NOT NULL foreign keys, so a challenge and its goal could not be inserted.

Revision ID: e1a7c4b9f2d6
Revises: d8f2b6a4c3e1
Create Date: 2026-10-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "e1a7c4b9f2d6"
down_revision: str | Sequence[str] | None = "d8f2b6a4c3e1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    for foreign_key in sa.inspect(op.get_bind()).get_foreign_keys("challenge"):
        if foreign_key["constrained_columns"] == ["goal_id"]:
            op.drop_constraint(foreign_key["name"], "challenge", type_="foreignkey")
    op.drop_column("challenge", "goal_id")


def downgrade() -> None:
    op.add_column("challenge", sa.Column("goal_id", sa.UUID(), nullable=True))
    op.execute(
        "UPDATE challenge AS c SET goal_id = g.id FROM goal AS g "
        "WHERE g.challenge_id = c.id"
    )
    op.create_foreign_key(
        "challenge_goal_id_fkey", "challenge", "goal", ["goal_id"], ["id"]
    )
