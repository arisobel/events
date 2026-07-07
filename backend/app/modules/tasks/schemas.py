"""Tasks module - schemas, service, router."""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    f_title: str
    f_description: Optional[str] = None
    f_priority: str = 'medium'
    f_task_type: Optional[str] = None
    f_space_id: Optional[int] = None  # espaço estruturado (Fatia 2)
    # Fatia 5: executor e líder apontam para o engajamento (t_event_staff)
    f_assigned_to_staff_id: Optional[int] = None
    f_leader_staff_id: Optional[int] = None
    f_activity_id: Optional[int] = None  # task de suporte a uma atividade do programa

class TaskCreate(TaskBase):
    f_event_id: int

class TaskUpdate(BaseModel):
    f_title: Optional[str] = None
    f_status: Optional[str] = None
    f_description: Optional[str] = None
    f_priority: Optional[str] = None
    f_task_type: Optional[str] = None
    f_space_id: Optional[int] = None
    f_assigned_to_staff_id: Optional[int] = None
    f_leader_staff_id: Optional[int] = None
    f_activity_id: Optional[int] = None

class TaskStatusUpdate(BaseModel):
    new_status: str

class TaskResponse(TaskBase):
    id: int
    f_event_id: int
    f_status: str
    space_name: Optional[str] = None  # nome do espaço resolvido (property do model)
    assigned_staff_name: Optional[str] = None  # executor (via engajamento)
    leader_staff_name: Optional[str] = None    # líder/ponto focal
    activity_title: Optional[str] = None       # atividade do programa ligada
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
