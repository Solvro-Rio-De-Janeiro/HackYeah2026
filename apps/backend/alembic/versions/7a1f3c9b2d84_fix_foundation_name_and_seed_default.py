"""fix foundation name type and seed default foundation

Revision ID: 7a1f3c9b2d84
Revises: 6290aadeb7a7
Create Date: 2026-10-04 06:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a1f3c9b2d84'
down_revision: Union[str, Sequence[str], None] = ('6290aadeb7a7', '5b6c7d8e9f10')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_FOUNDATION_ID = '2c538172-80f4-49e6-a532-3d6777f1df46'


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'foundation',
        'name',
        existing_type=sa.BigInteger(),
        type_=sa.String(length=255),
        existing_nullable=False,
        postgresql_using="name::varchar(255)",
    )
    op.execute(
        sa.text(
            "INSERT INTO foundation (id, name) VALUES (CAST(:id AS uuid), :name) "
            "ON CONFLICT (id) DO NOTHING"
        ).bindparams(id=DEFAULT_FOUNDATION_ID, name="Fundacja Odnowa")
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        sa.text("DELETE FROM foundation WHERE id = :id").bindparams(
            id=DEFAULT_FOUNDATION_ID
        )
    )
    op.alter_column(
        'foundation',
        'name',
        existing_type=sa.String(length=255),
        type_=sa.BigInteger(),
        existing_nullable=False,
        postgresql_using="name::bigint",
    )
