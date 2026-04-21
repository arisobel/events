"""Tasks module - service layer."""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import models, schemas

def get_event_tasks(db: Session, event_id: int) -> List[models.Task]:
    return db.query(models.Task).filter(models.Task.f_event_id == event_id).all()

def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task_status(db: Session, task_id: int, new_status: str, staff_id: Optional[int] = None) -> Optional[models.Task]:
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    
    old_status = db_task.f_status
    db_task.f_status = new_status
    
    if new_status == 'in_progress' and not db_task.f_started_at:
        db_task.f_started_at = datetime.utcnow()
    elif new_status == 'completed' and not db_task.f_completed_at:
        db_task.f_completed_at = datetime.utcnow()
    
    history = models.TaskStatusHistory(
        f_task_id=task_id,
        f_old_status=old_status,
        f_new_status=new_status,
        f_changed_by_staff_id=staff_id
    )
    db.add(history)
    db.commit()
    db.refresh(db_task)
    return db_task

def add_task_comment(db: Session, task_id: int, comment: schemas.TaskCommentCreate) -> models.TaskComment:
    db_comment = models.TaskComment(f_task_id=task_id, **comment.model_dump())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment
