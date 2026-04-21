"""Events module - FastAPI routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas


router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[schemas.EventResponse])
def list_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all events."""
    return service.get_events(db, skip=skip, limit=limit)


@router.post("", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new event."""
    return service.create_event(db, event)


@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get event by ID."""
    event = service.get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id: int,
    event: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update event."""
    updated = service.update_event(db, event_id, event)
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated


@router.get("/{event_id}/periods", response_model=List[schemas.EventPeriodResponse])
def get_event_periods(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get periods for an event."""
    return service.get_event_periods(db, event_id)


@router.post("/{event_id}/periods", response_model=schemas.EventPeriodResponse, status_code=status.HTTP_201_CREATED)
def create_period(
    event_id: int,
    period: schemas.EventPeriodBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a period for an event."""
    period_create = schemas.EventPeriodCreate(**period.model_dump(), f_event_id=event_id)
    return service.create_event_period(db, period_create)
