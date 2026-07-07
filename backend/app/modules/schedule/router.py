"""Schedule module - FastAPI routes.

Gestão do cronograma é operacional (não financeira): qualquer usuário ativo
gerencia. A visibilidade pública (app do hóspede / displays de TV) virá em
endpoints públicos dedicados numa fatia futura.
"""
from datetime import date as date_type
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User

from . import schemas, service

router = APIRouter(tags=["Schedule"])


@router.get("/events/{event_id}/activities", response_model=List[schemas.ActivityResponse])
def list_event_activities(
    event_id: int,
    day: Optional[date_type] = None,
    activity_type: Optional[str] = None,
    audience: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return service.get_event_activities(db, event_id, day, activity_type, audience)


@router.post(
    "/events/{event_id}/activities",
    response_model=schemas.ActivityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_activity(
    event_id: int,
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        return service.create_activity(db, event_id, activity)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/activities/{activity_id}", response_model=schemas.ActivityResponse)
def update_activity(
    activity_id: int,
    activity: schemas.ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        updated = service.update_activity(db, activity_id, activity)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Activity not found")
    return updated


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.delete_activity(db, activity_id):
        raise HTTPException(status_code=404, detail="Activity not found")
    return None
