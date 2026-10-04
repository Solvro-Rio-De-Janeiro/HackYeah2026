"""add group code

Revision ID: 6290aadeb7a7
Revises: 4be128b870ed
Create Date: 2026-10-04 03:47:06.050743

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6290aadeb7a7'
down_revision: Union[str, Sequence[str], None] = '4be128b870ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('group', sa.Column('code', sa.String(length=8), nullable=False))
    op.create_unique_constraint('group_code_key', 'group', ['code'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('group_code_key', 'group', type_='unique')
    op.drop_column('group', 'code')
