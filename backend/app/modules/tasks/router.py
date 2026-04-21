"""Tasks module - FastAPI routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas

router = APIRouter(tags=["Tasks"])

@router.get("/events/{event_id}/tasks", response_model=List[schemas.TaskResponse])
def list_event_tasks(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return service.get_event_tasks(db, event_id)

@router.post("/events/{event_id}/tasks", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(event_id: int, task: schemas.TaskBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    task_create = schemas.TaskCreate(**task.model_dump(), f_event_id=event_id)
    return service.create_task(db, task_create)

@router.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    task = service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, status_update: schemas.TaskStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    task = service.update_task_status(db, task_id, status_update.new_status, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/tasks/{task_id}/comments", response_model=schemas.TaskCommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(task_id: int, comment: schemas.TaskCommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return service.add_task_comment(db, task_id, comment)
