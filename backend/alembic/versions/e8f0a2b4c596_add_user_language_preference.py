"""Add user UI language preference (i18n Fase A1)

Revision ID: e8f0a2b4c596
Revises: e7a9c1b3d586
Create Date: 2026-08-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8f0a2b4c596'
down_revision: Union[str, Sequence[str], None] = 'e7a9c1b3d586'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('t_user', sa.Column('f_language', sa.String(length=10), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('t_user', 'f_language')
