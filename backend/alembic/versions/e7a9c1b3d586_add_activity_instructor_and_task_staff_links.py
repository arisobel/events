"""Add activity instructor and task staff/activity links (Fatias 4 e 5)

Revision ID: e7a9c1b3d586
Revises: d6e8f0a2c374
Create Date: 2026-07-07 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7a9c1b3d586'
down_revision: Union[str, Sequence[str], None] = 'd6e8f0a2c374'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fatia 4: ministrante da atividade — FK opcional para o Employee raiz
    op.add_column(
        't_activity',
        sa.Column('f_instructor_id', sa.Integer(), sa.ForeignKey('t_employee.id'), nullable=True),
    )

    # Fatia 5: f_assigned_to_staff_id era Integer sem FK desde a criação do módulo.
    # Nunca houve UI para preenchê-lo; valores órfãos (sem engajamento) são anulados
    # antes de criar a constraint para o upgrade não falhar em bases existentes.
    op.execute(
        "UPDATE t_task SET f_assigned_to_staff_id = NULL "
        "WHERE f_assigned_to_staff_id IS NOT NULL "
        "AND f_assigned_to_staff_id NOT IN (SELECT id FROM t_event_staff)"
    )
    op.create_foreign_key(
        'fk_task_assigned_staff', 't_task', 't_event_staff',
        ['f_assigned_to_staff_id'], ['id'],
    )
    op.add_column(
        't_task',
        sa.Column('f_leader_staff_id', sa.Integer(), sa.ForeignKey('t_event_staff.id'), nullable=True),
    )
    op.add_column(
        't_task',
        sa.Column('f_activity_id', sa.Integer(), sa.ForeignKey('t_activity.id'), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('t_task', 'f_activity_id')
    op.drop_column('t_task', 'f_leader_staff_id')
    op.drop_constraint('fk_task_assigned_staff', 't_task', type_='foreignkey')
    op.drop_column('t_activity', 'f_instructor_id')
