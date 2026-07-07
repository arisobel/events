"""Add optional space FK to activity and task (Facilities Fatia 2)

Revision ID: b4c6d8e0f152
Revises: a3d9e5c7b410
Create Date: 2026-07-07 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4c6d8e0f152'
down_revision: Union[str, Sequence[str], None] = 'a3d9e5c7b410'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # FK opcional — f_location (texto livre) permanece como fallback/legado
    op.add_column(
        't_activity',
        sa.Column('f_space_id', sa.Integer(), sa.ForeignKey('t_hotel_space.id'), nullable=True),
    )
    op.add_column(
        't_task',
        sa.Column('f_space_id', sa.Integer(), sa.ForeignKey('t_hotel_space.id'), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('t_task', 'f_space_id')
    op.drop_column('t_activity', 'f_space_id')
