"""Tasks module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional
from app.db.base import Base


class Task(Base):
    __tablename__ = "t_task"

    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_title = Column(String(200), nullable=False)
    f_description = Column(Text)
    f_priority = Column(String(20), default='medium')
    f_status = Column(String(30), default='pending')
    f_task_type = Column(String(50))
    # Espaço estruturado (Fatia 2 — antecipado da Fatia 5, não depende de Staff)
    f_space_id = Column(Integer, ForeignKey("t_hotel_space.id"))
    # Fatia 5 (início da fase de execução): executor e líder apontam para o
    # ENGAJAMENTO (t_event_staff), não para o Employee raiz — garante que a pessoa
    # está engajada neste evento. Líder = quem responde pela task para a alta
    # gestão; distinto de quem executa.
    f_assigned_to_staff_id = Column(Integer, ForeignKey("t_event_staff.id"))
    f_leader_staff_id = Column(Integer, ForeignKey("t_event_staff.id"))
    # Task de suporte/montagem de uma atividade do programa (Task ≠ Activity:
    # task é trabalho interno; activity é o programa público do evento)
    f_activity_id = Column(Integer, ForeignKey("t_activity.id"))
    f_due_datetime = Column(DateTime)
    f_started_at = Column(DateTime)
    f_completed_at = Column(DateTime)
    f_created_at = Column(DateTime, default=datetime.utcnow)

    comments = relationship("TaskComment", back_populates="task")
    status_history = relationship("TaskStatusHistory", back_populates="task")
    space = relationship("HotelSpace")
    assigned_staff = relationship("EventStaffAssignment", foreign_keys=[f_assigned_to_staff_id])
    leader_staff = relationship("EventStaffAssignment", foreign_keys=[f_leader_staff_id])
    activity = relationship("Activity")

    @property
    def space_name(self) -> Optional[str]:
        return self.space.f_name if self.space else None

    @property
    def assigned_staff_name(self) -> Optional[str]:
        return self.assigned_staff.employee_name if self.assigned_staff else None

    @property
    def leader_staff_name(self) -> Optional[str]:
        return self.leader_staff.employee_name if self.leader_staff else None

    @property
    def activity_title(self) -> Optional[str]:
        return self.activity.f_title if self.activity else None


class TaskComment(Base):
    __tablename__ = "t_task_comment"
    
    id = Column(Integer, primary_key=True, index=True)
    f_task_id = Column(Integer, ForeignKey("t_task.id"), nullable=False)
    f_staff_member_id = Column(Integer)
    f_comment = Column(Text, nullable=False)
    f_created_at = Column(DateTime, default=datetime.utcnow)
    
    task = relationship("Task", back_populates="comments")


class TaskStatusHistory(Base):
    __tablename__ = "t_task_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    f_task_id = Column(Integer, ForeignKey("t_task.id"), nullable=False)
    f_old_status = Column(String(30))
    f_new_status = Column(String(30))
    f_changed_by_staff_id = Column(Integer)
    f_changed_at = Column(DateTime, default=datetime.utcnow)
    
    task = relationship("Task", back_populates="status_history")
