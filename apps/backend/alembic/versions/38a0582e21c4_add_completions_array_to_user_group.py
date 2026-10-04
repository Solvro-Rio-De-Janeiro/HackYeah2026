"""add completions array to user_group

Revision ID: 38a0582e21c4
Revises: 8022de801168
Create Date: 2026-10-03 22:34:40.294504

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '38a0582e21c4'
down_revision: Union[str, Sequence[str], None] = '8022de801168'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "user_group",
        sa.Column(
            "completions",
            sa.ARRAY(sa.Boolean()),
            nullable=False,
            server_default="{}",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("user_group", "completions")
