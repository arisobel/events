"""Add finance fields: room pricing and reservation payment tracking

Revision ID: 9d2f5c1e7a34
Revises: 6b1c4a8d9f20
Create Date: 2026-07-02 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9d2f5c1e7a34'
down_revision: Union[str, Sequence[str], None] = '6b1c4a8d9f20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('t_hotel_room', sa.Column('f_room_type_label', sa.String(length=100), nullable=True))
    op.add_column('t_hotel_room', sa.Column('f_price_per_night', sa.Numeric(10, 2), nullable=True))

    op.add_column('t_reservation', sa.Column('f_amount_total', sa.Numeric(10, 2), nullable=True))
    op.add_column(
        't_reservation',
        sa.Column('f_amount_paid', sa.Numeric(10, 2), nullable=False, server_default='0'),
    )
    op.add_column(
        't_reservation',
        sa.Column('f_payment_status', sa.String(length=20), nullable=False, server_default='pending'),
    )
    op.add_column('t_reservation', sa.Column('f_payment_notes', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('t_reservation', 'f_payment_notes')
    op.drop_column('t_reservation', 'f_payment_status')
    op.drop_column('t_reservation', 'f_amount_paid')
    op.drop_column('t_reservation', 'f_amount_total')

    op.drop_column('t_hotel_room', 'f_price_per_night')
    op.drop_column('t_hotel_room', 'f_room_type_label')
