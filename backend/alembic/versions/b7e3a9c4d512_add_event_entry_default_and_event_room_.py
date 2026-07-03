"""Add event entry default flag and event room price table

Revision ID: b7e3a9c4d512
Revises: 9d2f5c1e7a34
Create Date: 2026-07-03 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7e3a9c4d512'
down_revision: Union[str, Sequence[str], None] = '9d2f5c1e7a34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        't_event',
        sa.Column('f_is_entry_default', sa.Boolean(), nullable=False, server_default=sa.false()),
    )

    op.create_table(
        't_event_room_price',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_event_id', sa.Integer(), sa.ForeignKey('t_event.id'), nullable=False),
        sa.Column('f_room_id', sa.Integer(), sa.ForeignKey('t_hotel_room.id'), nullable=False),
        sa.Column('f_price_per_night', sa.Numeric(10, 2), nullable=False),
        sa.UniqueConstraint('f_event_id', 'f_room_id', name='uq_event_room_price'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('t_event_room_price')
    op.drop_column('t_event', 'f_is_entry_default')
