"""Rooms module - FastAPI routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas

router = APIRouter(tags=["Rooms"])


@router.post("/room-allocations", response_model=schemas.RoomAllocationResponse, status_code=status.HTTP_201_CREATED)
def create_allocation(
    allocation: schemas.RoomAllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        return service.create_room_allocation(db, allocation)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/room-allocations/{allocation_id}", response_model=schemas.RoomAllocationResponse)
def get_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    allocation = service.get_room_allocation(db, allocation_id)
    if not allocation:
        raise HTTPException(status_code=404, detail="Room allocation not found")
    return allocation


@router.put("/room-allocations/{allocation_id}", response_model=schemas.RoomAllocationResponse)
def update_allocation(
    allocation_id: int,
    allocation: schemas.RoomAllocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        updated_allocation = service.update_room_allocation(db, allocation_id, allocation)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not updated_allocation:
        raise HTTPException(status_code=404, detail="Room allocation not found")
    return updated_allocation


@router.get(
    "/reservations/{reservation_id}/room-allocations",
    response_model=List[schemas.RoomAllocationResponse],
)
def list_reservation_allocations(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return service.get_reservation_allocations(db, reservation_id)
