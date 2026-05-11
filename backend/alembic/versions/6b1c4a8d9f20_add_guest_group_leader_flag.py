"""Add guest leader flag

Revision ID: 6b1c4a8d9f20
Revises: 1be60f7aface
Create Date: 2026-05-10 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b1c4a8d9f20'
down_revision: Union[str, Sequence[str], None] = '1be60f7aface'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        't_guest',
        sa.Column(
            'f_is_group_leader',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.alter_column('t_guest', 'f_is_group_leader', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('t_guest', 'f_is_group_leader')
