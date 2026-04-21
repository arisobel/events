"""Tasks module - schemas, service, router."""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    f_title: str
    f_description: Optional[str] = None
    f_priority: str = 'medium'
    f_task_type: Optional[str] = None

class TaskCreate(TaskBase):
    f_event_id: int

class TaskUpdate(BaseModel):
    f_status: Optional[str] = None
    f_description: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    new_status: str

class TaskResponse(TaskBase):
    id: int
    f_event_id: int
    f_status: str
    f_created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TaskCommentCreate(BaseModel):
    f_comment: str
    f_staff_member_id: Optional[int] = None

class TaskCommentResponse(TaskCommentCreate):
    id: int
    f_task_id: int
    f_created_at: datetime
    model_config = ConfigDict(from_attributes=True)
