"""Rooms module - FastAPI routes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas

router = APIRouter(prefix="/room-allocations", tags=["Rooms"])

@router.post("", response_model=schemas.RoomAllocationResponse, status_code=status.HTTP_201_CREATED)
def create_allocation(allocation: schemas.RoomAllocationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return service.create_room_allocation(db, allocation)
