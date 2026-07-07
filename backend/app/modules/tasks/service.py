"""Tasks module - service layer."""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from . import models, schemas

def get_event_tasks(db: Session, event_id: int) -> List[models.Task]:
    return db.query(models.Task).filter(models.Task.f_event_id == event_id).all()

def get_task(db: Session, task_id: int) -> Optional[models.Task]:
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def _validate_staff_assignment(db: Session, event_id: int, assignment_id: Optional[int], label: str) -> None:
    """Executor/líder apontam para o ENGAJAMENTO (t_event_staff) — precisa existir
    e pertencer ao mesmo evento da task (decisão Fatia 5)."""
    if assignment_id is None:
        return
    from app.modules.staff.models import EventStaffAssignment

    assignment = (
        db.query(EventStaffAssignment)
        .filter(EventStaffAssignment.id == assignment_id)
        .first()
    )
    if not assignment:
        raise ValueError(f"{label}: staff assignment not found")
    if assignment.f_event_id != event_id:
        raise ValueError(f"{label}: staff assignment does not belong to this event")


def _validate_activity(db: Session, event_id: int, activity_id: Optional[int]) -> None:
    if activity_id is None:
        return
    from app.modules.schedule.models import Activity

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise ValueError("Activity not found")
    if activity.f_event_id != event_id:
        raise ValueError("Activity does not belong to this event")


def _validate_links(db: Session, event_id: int, data: dict) -> None:
    if "f_assigned_to_staff_id" in data:
        _validate_staff_assignment(db, event_id, data["f_assigned_to_staff_id"], "Executor")
    if "f_leader_staff_id" in data:
        _validate_staff_assignment(db, event_id, data["f_leader_staff_id"], "Leader")
    if "f_activity_id" in data:
        _validate_activity(db, event_id, data["f_activity_id"])


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    from app.modules.hotel import service as hotel_service

    hotel_service.validate_space_for_event(db, task.f_event_id, task.f_space_id)
    _validate_links(db, task.f_event_id, task.model_dump())
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, data: schemas.TaskUpdate) -> Optional[models.Task]:
    """Atualização geral da task (status tem fluxo próprio em update_task_status)."""
    from app.modules.hotel import service as hotel_service

    db_task = get_task(db, task_id)
    if not db_task:
        return None
    update_data = data.model_dump(exclude_unset=True)
    update_data.pop("f_status", None)  # status muda via update_task_status (gera histórico)
    if "f_space_id" in update_data:
        hotel_service.validate_space_for_event(db, db_task.f_event_id, update_data["f_space_id"])
    _validate_links(db, db_task.f_event_id, update_data)
    for field, value in update_data.items():
        setattr(db_task, field, value)
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
