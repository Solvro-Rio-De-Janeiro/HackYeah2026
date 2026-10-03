"""Track amounts received after Stripe fees, in grosze.

Revision ID: c9e5a3f1d7b4
Revises: b7d4e2f9c1a8
Create Date: 2026-10-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c9e5a3f1d7b4"
down_revision: str | Sequence[str] | None = "b7d4e2f9c1a8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "payment", sa.Column("net_amount_gr", sa.Integer(), nullable=True)
    )
    op.execute("UPDATE payment SET net_amount_gr = amount_pln * 100")
    op.alter_column("payment", "net_amount_gr", nullable=False)
    op.create_check_constraint(
        "ck_payment_net_amount_positive", "payment", "net_amount_gr > 0"
    )

    op.add_column(
        "subscription",
        sa.Column(
            "collected_net_gr", sa.Integer(), server_default="0", nullable=False
        ),
    )
    op.execute("UPDATE subscription SET collected_net_gr = collected_pln * 100")
    op.create_check_constraint(
        "ck_subscription_collected_net_non_negative",
        "subscription",
        "collected_net_gr >= 0",
    )

    op.drop_constraint("ck_payout_amount_positive", "payout", type_="check")
    op.alter_column("payout", "amount_pln", new_column_name="amount_gr")
    op.execute("UPDATE payout SET amount_gr = amount_gr * 100")
    op.create_check_constraint("ck_payout_amount_positive", "payout", "amount_gr > 0")


def downgrade() -> None:
    op.drop_constraint("ck_payout_amount_positive", "payout", type_="check")
    op.execute("UPDATE payout SET amount_gr = GREATEST(amount_gr / 100, 1)")
    op.alter_column("payout", "amount_gr", new_column_name="amount_pln")
    op.create_check_constraint("ck_payout_amount_positive", "payout", "amount_pln > 0")

    op.drop_constraint(
        "ck_subscription_collected_net_non_negative", "subscription", type_="check"
    )
    op.drop_column("subscription", "collected_net_gr")

    op.drop_constraint("ck_payment_net_amount_positive", "payment", type_="check")
    op.drop_column("payment", "net_amount_gr")
