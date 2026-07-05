"""Add clients and persons (root registry) + optional FKs on group/guest

Revision ID: e1b9c3f5a7d2
Revises: d4a7f0c1e256
Create Date: 2026-07-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1b9c3f5a7d2'
down_revision: Union[str, Sequence[str], None] = 'd4a7f0c1e256'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        't_client',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_name', sa.String(length=150), nullable=False),
        sa.Column('f_client_type', sa.String(length=50), nullable=True),
        sa.Column('f_nationality', sa.String(length=2), nullable=True),
        sa.Column('f_document', sa.String(length=50), nullable=True),
        sa.Column('f_phone', sa.String(length=50), nullable=True),
        sa.Column('f_email', sa.String(length=150), nullable=True),
        sa.Column('f_notes', sa.Text(), nullable=True),
    )

    op.create_table(
        't_person',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_client_id', sa.Integer(), sa.ForeignKey('t_client.id'), nullable=False),
        sa.Column('f_full_name', sa.String(length=150), nullable=False),
        sa.Column('f_gender', sa.String(length=20), nullable=True),
        sa.Column('f_birth_date', sa.Date(), nullable=True),
        sa.Column('f_document', sa.String(length=50), nullable=True),
        sa.Column('f_phone', sa.String(length=50), nullable=True),
        sa.Column('f_email', sa.String(length=150), nullable=True),
        sa.Column('f_is_primary', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('f_notes', sa.Text(), nullable=True),
    )

    op.add_column('t_guest_group', sa.Column('f_client_id', sa.Integer(), sa.ForeignKey('t_client.id'), nullable=True))
    op.add_column('t_guest', sa.Column('f_person_id', sa.Integer(), sa.ForeignKey('t_person.id'), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('t_guest', 'f_person_id')
    op.drop_column('t_guest_group', 'f_client_id')
    op.drop_table('t_person')
    op.drop_table('t_client')
