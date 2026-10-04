"""merge stripe and notifications heads

Revision ID: 4be128b870ed
Revises: e1a7c4b9f2d6, ab6e7352130d
Create Date: 2026-10-04 01:26:35.276798

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4be128b870ed'
down_revision: Union[str, Sequence[str], None] = ('e1a7c4b9f2d6', 'ab6e7352130d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
