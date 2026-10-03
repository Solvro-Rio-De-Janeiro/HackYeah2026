"""merge heads

Revision ID: 16e567fa2f1d
Revises: 38a0582e21c4, 399b70c0b942
Create Date: 2026-10-03 23:52:29.649407

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '16e567fa2f1d'
down_revision: Union[str, Sequence[str], None] = ('38a0582e21c4', '399b70c0b942')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
