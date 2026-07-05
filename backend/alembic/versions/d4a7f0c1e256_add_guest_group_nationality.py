"""Add guest group nationality

Revision ID: d4a7f0c1e256
Revises: c8f1a2b6e934
Create Date: 2026-07-05 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4a7f0c1e256'
down_revision: Union[str, Sequence[str], None] = 'c8f1a2b6e934'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('t_guest_group', sa.Column('f_nationality', sa.String(length=2), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('t_guest_group', 'f_nationality')
