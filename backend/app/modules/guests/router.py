"""Guests module - FastAPI routes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas

router = APIRouter(prefix="/events/{event_id}/groups", tags=["Guests"])

@router.get("", response_model=List[schemas.GuestGroupResponse])
def list_guest_groups(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return service.get_event_groups(db, event_id)

@router.post("", response_model=schemas.GuestGroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(event_id: int, group: schemas.GuestGroupBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    group_create = schemas.GuestGroupCreate(**group.model_dump(), f_event_id=event_id)
    return service.create_guest_group(db, group_create)
