"""Hotel module - FastAPI routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas


router = APIRouter(prefix="/hotels", tags=["Hotels"])


@router.get("", response_model=List[schemas.HotelResponse])
def list_hotels(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all active hotels."""
    hotels = service.get_hotels(db, skip=skip, limit=limit)
    return hotels


@router.post("", response_model=schemas.HotelResponse, status_code=status.HTTP_201_CREATED)
def create_hotel(
    hotel: schemas.HotelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new hotel."""
    return service.create_hotel(db, hotel)


@router.get("/{hotel_id}", response_model=schemas.HotelResponse)
def get_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get hotel by ID."""
    hotel = service.get_hotel(db, hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.put("/{hotel_id}", response_model=schemas.HotelResponse)
def update_hotel(
    hotel_id: int,
    hotel: schemas.HotelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update hotel."""
    updated_hotel = service.update_hotel(db, hotel_id, hotel)
    if not updated_hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return updated_hotel


@router.get("/{hotel_id}/spaces", response_model=List[schemas.HotelSpaceResponse])
def get_hotel_spaces(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all spaces for a hotel."""
    return service.get_hotel_spaces(db, hotel_id)


@router.post("/{hotel_id}/spaces", response_model=schemas.HotelSpaceResponse, status_code=status.HTTP_201_CREATED)
def create_space(
    hotel_id: int,
    space: schemas.HotelSpaceBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new space for a hotel."""
    space_create = schemas.HotelSpaceCreate(**space.model_dump(), f_hotel_id=hotel_id)
    return service.create_hotel_space(db, space_create)


@router.get("/{hotel_id}/rooms", response_model=List[schemas.HotelRoomResponse])
def get_hotel_rooms(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all rooms for a hotel."""
    return service.get_hotel_rooms(db, hotel_id)


@router.post("/{hotel_id}/rooms", response_model=schemas.HotelRoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    hotel_id: int,
    room: schemas.HotelRoomBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new room for a hotel."""
    room_create = schemas.HotelRoomCreate(**room.model_dump(), f_hotel_id=hotel_id)
    return service.create_hotel_room(db, room_create)


@router.get("/{hotel_id}/kitchens", response_model=List[schemas.HotelKitchenResponse])
def get_hotel_kitchens(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all kitchens for a hotel."""
    return service.get_hotel_kitchens(db, hotel_id)


@router.get("/{hotel_id}/tables", response_model=List[schemas.HotelTableResponse])
def get_hotel_tables(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all tables for a hotel."""
    return service.get_hotel_tables(db, hotel_id)
