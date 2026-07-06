"""Add ledger entry (client account statement - manual adjustments)

Revision ID: f2c8a4e6b1d3
Revises: e1b9c3f5a7d2
Create Date: 2026-07-05 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f2c8a4e6b1d3'
down_revision: Union[str, Sequence[str], None] = 'e1b9c3f5a7d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        't_ledger_entry',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_client_id', sa.Integer(), sa.ForeignKey('t_client.id'), nullable=False),
        sa.Column('f_entry_type', sa.String(length=10), nullable=False),
        sa.Column('f_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('f_date', sa.Date(), nullable=False),
        sa.Column('f_description', sa.String(length=200), nullable=False),
        sa.Column('f_notes', sa.Text(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('t_ledger_entry')
