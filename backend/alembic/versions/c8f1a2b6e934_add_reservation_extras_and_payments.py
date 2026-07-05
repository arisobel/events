"""Add reservation extras and payments

Revision ID: c8f1a2b6e934
Revises: b7e3a9c4d512
Create Date: 2026-07-03 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c8f1a2b6e934'
down_revision: Union[str, Sequence[str], None] = 'b7e3a9c4d512'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        't_reservation_extra',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_reservation_id', sa.Integer(), sa.ForeignKey('t_reservation.id'), nullable=False),
        sa.Column('f_description', sa.String(length=150), nullable=False),
        sa.Column('f_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('f_notes', sa.Text(), nullable=True),
    )

    op.create_table(
        't_payment',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_reservation_id', sa.Integer(), sa.ForeignKey('t_reservation.id'), nullable=False),
        sa.Column('f_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('f_paid_at', sa.Date(), nullable=False),
        sa.Column('f_method', sa.String(length=50), nullable=True),
        sa.Column('f_notes', sa.Text(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('t_payment')
    op.drop_table('t_reservation_extra')
