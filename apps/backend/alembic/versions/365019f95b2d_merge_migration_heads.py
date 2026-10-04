"""merge migration heads

Revision ID: 365019f95b2d
Revises: 4be128b870ed, f6a2c8d1e904
Create Date: 2026-10-04 03:57:53.040335

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '365019f95b2d'
down_revision: Union[str, Sequence[str], None] = ('4be128b870ed', 'f6a2c8d1e904')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
