"""Add activity (event schedule / cronograma)

Revision ID: a3d9e5c7b410
Revises: f2c8a4e6b1d3
Create Date: 2026-07-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3d9e5c7b410'
down_revision: Union[str, Sequence[str], None] = 'f2c8a4e6b1d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        't_activity',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_event_id', sa.Integer(), sa.ForeignKey('t_event.id'), nullable=False, index=True),
        sa.Column('f_title', sa.String(length=200), nullable=False),
        sa.Column('f_activity_type', sa.String(length=30), nullable=False, server_default='geral'),
        sa.Column('f_audience', sa.String(length=20), nullable=False, server_default='all'),
        sa.Column('f_location', sa.String(length=150), nullable=True),
        sa.Column('f_date', sa.Date(), nullable=False, index=True),
        sa.Column('f_start_time', sa.String(length=5), nullable=False),
        sa.Column('f_end_time', sa.String(length=5), nullable=True),
        sa.Column('f_description', sa.Text(), nullable=True),
        sa.Column('f_sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('f_created_at', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('t_activity')
