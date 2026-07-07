"""Add employee (root) and event staff assignment (Facilities+Staff Fatia 3)

Revision ID: d6e8f0a2c374
Revises: b4c6d8e0f152
Create Date: 2026-07-07 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6e8f0a2c374'
down_revision: Union[str, Sequence[str], None] = 'b4c6d8e0f152'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        't_employee',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_person_id', sa.Integer(), sa.ForeignKey('t_person.id'), nullable=True),
        sa.Column('f_full_name', sa.String(length=150), nullable=False),
        sa.Column('f_default_role', sa.String(length=50), nullable=True),
        sa.Column('f_document', sa.String(length=50), nullable=True),
        sa.Column('f_phone', sa.String(length=50), nullable=True),
        sa.Column('f_email', sa.String(length=150), nullable=True),
        sa.Column('f_default_daily_cost', sa.Numeric(10, 2), nullable=True),
        sa.Column('f_notes', sa.Text(), nullable=True),
        sa.Column('f_is_active', sa.CHAR(length=1), nullable=True, server_default='T'),
        sa.Column('f_created_at', sa.DateTime(), nullable=True),
    )
    op.create_table(
        't_event_staff',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('f_event_id', sa.Integer(), sa.ForeignKey('t_event.id'), nullable=False, index=True),
        sa.Column('f_employee_id', sa.Integer(), sa.ForeignKey('t_employee.id'), nullable=False, index=True),
        sa.Column('f_role', sa.String(length=50), nullable=True),
        sa.Column('f_start_date', sa.Date(), nullable=True),
        sa.Column('f_end_date', sa.Date(), nullable=True),
        sa.Column('f_daily_cost', sa.Numeric(10, 2), nullable=True),
        sa.Column('f_total_cost', sa.Numeric(10, 2), nullable=True),
        sa.Column('f_notes', sa.Text(), nullable=True),
        sa.Column('f_created_at', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('t_event_staff')
    op.drop_table('t_employee')
