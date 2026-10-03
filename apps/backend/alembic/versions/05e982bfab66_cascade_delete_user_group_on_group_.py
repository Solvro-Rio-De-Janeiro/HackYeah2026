"""cascade delete user_group on group delete

Revision ID: 05e982bfab66
Revises: 56a6ae2a89a7
Create Date: 2026-10-03 20:59:54.953211

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '05e982bfab66'
down_revision: Union[str, Sequence[str], None] = '56a6ae2a89a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        "user_group_group_id_fkey", "user_group", type_="foreignkey"
    )
    op.create_foreign_key(
        "user_group_group_id_fkey",
        "user_group",
        "group",
        ["group_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint(
        "group_member_balance_user_group_id_fkey",
        "group_member_balance",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "group_member_balance_user_group_id_fkey",
        "group_member_balance",
        "user_group",
        ["user_group_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "group_member_balance_user_group_id_fkey",
        "group_member_balance",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "group_member_balance_user_group_id_fkey",
        "group_member_balance",
        "user_group",
        ["user_group_id"],
        ["id"],
    )

    op.drop_constraint(
        "user_group_group_id_fkey", "user_group", type_="foreignkey"
    )
    op.create_foreign_key(
        "user_group_group_id_fkey",
        "user_group",
        "group",
        ["group_id"],
        ["id"],
    )
