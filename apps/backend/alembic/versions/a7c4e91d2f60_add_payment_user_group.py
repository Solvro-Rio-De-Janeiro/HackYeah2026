"""Associate payments with a group membership.

Revision ID: a7c4e91d2f60
Revises: 9d8f2a1c6b45
Create Date: 2026-10-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a7c4e91d2f60"
down_revision: str | Sequence[str] | None = "9d8f2a1c6b45"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    connection = op.get_bind()
    columns = {
        column["name"]: column
        for column in sa.inspect(connection).get_columns("payment")
    }
    if "user_group_id" not in columns:
        op.add_column(
            "payment",
            sa.Column("user_group_id", sa.UUID(), nullable=True),
        )

    ambiguous_memberships = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM (
                SELECT p.id
                FROM payment AS p
                JOIN goal AS g ON g.id = p.goal_id
                JOIN challenge AS c ON c.id = g.challenge_id
                JOIN user_group AS ug
                  ON ug.user_id = p.user_id
                 AND ug.group_id = c.group_id
                                WHERE p.user_group_id IS NULL
                GROUP BY p.id
                HAVING COUNT(ug.id) <> 1
            ) AS ambiguous
            """
        )
    ).scalar_one()
    connection.execute(
        sa.text(
            """
            UPDATE payment AS p
            SET user_group_id = ug.id
            FROM goal AS g, challenge AS c, user_group AS ug
            WHERE p.user_group_id IS NULL
              AND g.id = p.goal_id
              AND c.id = g.challenge_id
              AND ug.user_id = p.user_id
              AND ug.group_id = c.group_id
            """
        )
    )
    unmapped_payments = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM payment AS p
            LEFT JOIN user_group AS ug ON ug.id = p.user_group_id
            LEFT JOIN goal AS g ON g.id = p.goal_id
            LEFT JOIN challenge AS c ON c.id = g.challenge_id
            WHERE ug.id IS NULL OR ug.group_id <> c.group_id
            """
        )
    ).scalar_one()
    if ambiguous_memberships or unmapped_payments:
        raise RuntimeError(
            "Each payment must reference exactly one user_group in the goal's "
            "challenge group; resolve inconsistent rows before retrying."
        )

    user_group_column = next(
        column
        for column in sa.inspect(connection).get_columns("payment")
        if column["name"] == "user_group_id"
    )
    if user_group_column["nullable"]:
        op.alter_column("payment", "user_group_id", nullable=False)

    has_membership_fk = any(
        foreign_key["constrained_columns"] == ["user_group_id"]
        and foreign_key["referred_table"] == "user_group"
        and foreign_key["referred_columns"] == ["id"]
        for foreign_key in sa.inspect(connection).get_foreign_keys("payment")
    )
    if not has_membership_fk:
        op.create_foreign_key(
            "payment_user_group_id_foreign",
            "payment",
            "user_group",
            ["user_group_id"],
            ["id"],
        )


def downgrade() -> None:
    connection = op.get_bind()
    user_group_fk = next(
        (
            foreign_key["name"]
            for foreign_key in sa.inspect(connection).get_foreign_keys("payment")
            if foreign_key["constrained_columns"] == ["user_group_id"]
            and foreign_key["referred_table"] == "user_group"
            and foreign_key["referred_columns"] == ["id"]
        ),
        None,
    )
    if user_group_fk is not None:
        op.drop_constraint(user_group_fk, "payment", type_="foreignkey")
    if any(
        column["name"] == "user_group_id"
        for column in sa.inspect(connection).get_columns("payment")
    ):
        op.drop_column("payment", "user_group_id")