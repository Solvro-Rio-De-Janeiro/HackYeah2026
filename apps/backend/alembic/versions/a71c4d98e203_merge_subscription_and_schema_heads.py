"""Merge subscription and schema migration heads.

Revision ID: a71c4d98e203
Revises: 02d865bbde85, cb9725ee90e2
Create Date: 2026-10-04

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "a71c4d98e203"
down_revision: Union[str, Sequence[str], None] = ("02d865bbde85", "cb9725ee90e2")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
