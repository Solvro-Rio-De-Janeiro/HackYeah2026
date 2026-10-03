"""cascade delete user_group on user delete

Revision ID: 8022de801168
Revises: 05e982bfab66
Create Date: 2026-10-03 21:04:10.385072

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8022de801168'
down_revision: Union[str, Sequence[str], None] = '05e982bfab66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint("user_group_user_id_fkey", "user_group", type_="foreignkey")
    op.create_foreign_key(
        "user_group_user_id_fkey",
        "user_group",
        "user",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("user_group_user_id_fkey", "user_group", type_="foreignkey")
    op.create_foreign_key(
        "user_group_user_id_fkey",
        "user_group",
        "user",
        ["user_id"],
        ["id"],
    )
