"""Tasks module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
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
    f_assigned_to_staff_id = Column(Integer)
    f_due_datetime = Column(DateTime)
    f_started_at = Column(DateTime)
    f_completed_at = Column(DateTime)
    f_created_at = Column(DateTime, default=datetime.utcnow)
    
    comments = relationship("TaskComment", back_populates="task")
    status_history = relationship("TaskStatusHistory", back_populates="task")


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
