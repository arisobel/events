"""Rooms module - service layer."""
from sqlalchemy.orm import Session
from typing import List, Optional

from app.modules.events import models as event_models
from app.modules.guests import models as guest_models
from app.modules.hotel import models as hotel_models

from . import models, schemas


def get_room_allocation(db: Session, allocation_id: int) -> Optional[models.RoomAllocation]:
    return db.query(models.RoomAllocation).filter(models.RoomAllocation.id == allocation_id).first()


def get_reservation_allocations(db: Session, reservation_id: int) -> List[models.RoomAllocation]:
    return (
        db.query(models.RoomAllocation)
        .filter(models.RoomAllocation.f_reservation_id == reservation_id)
        .all()
    )


def _validate_allocation_payload(
    db: Session,
    reservation_id: int,
    room_id: int,
    start_date,
    end_date,
    allocation_id: Optional[int] = None,
) -> guest_models.Reservation:
    reservation = (
        db.query(guest_models.Reservation)
        .filter(guest_models.Reservation.id == reservation_id)
        .first()
    )
    if not reservation:
        raise ValueError("Reservation not found")

    room = db.query(hotel_models.HotelRoom).filter(hotel_models.HotelRoom.id == room_id).first()
    if not room:
        raise ValueError("Room not found")

    event = db.query(event_models.Event).filter(event_models.Event.id == reservation.f_event_id).first()
    if not event:
        raise ValueError("Event not found for reservation")

    if room.f_hotel_id != event.f_hotel_id:
        raise ValueError("Room does not belong to the event hotel")

    if start_date > end_date:
        raise ValueError("Allocation start date must be before or equal to end date")

    if start_date < reservation.f_start_date or end_date > reservation.f_end_date:
        raise ValueError("Allocation dates must stay within reservation dates")

    conflict_query = db.query(models.RoomAllocation).filter(
        models.RoomAllocation.f_room_id == room_id,
        models.RoomAllocation.f_start_date <= end_date,
        models.RoomAllocation.f_end_date >= start_date,
    )
    if allocation_id is not None:
        conflict_query = conflict_query.filter(models.RoomAllocation.id != allocation_id)

    if conflict_query.first():
        raise ValueError("Room allocation conflicts with an existing allocation")

    return reservation


def create_room_allocation(db: Session, allocation: schemas.RoomAllocationCreate) -> models.RoomAllocation:
    _validate_allocation_payload(
        db,
        allocation.f_reservation_id,
        allocation.f_room_id,
        allocation.f_start_date,
        allocation.f_end_date,
    )

    db_allocation = models.RoomAllocation(**allocation.model_dump())
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    return db_allocation


def update_room_allocation(
    db: Session,
    allocation_id: int,
    allocation: schemas.RoomAllocationUpdate,
) -> Optional[models.RoomAllocation]:
    db_allocation = get_room_allocation(db, allocation_id)
    if not db_allocation:
        return None

    update_data = allocation.model_dump(exclude_unset=True)
    room_id = update_data.get("f_room_id", db_allocation.f_room_id)
    start_date = update_data.get("f_start_date", db_allocation.f_start_date)
    end_date = update_data.get("f_end_date", db_allocation.f_end_date)

    _validate_allocation_payload(
        db,
        db_allocation.f_reservation_id,
        room_id,
        start_date,
        end_date,
        allocation_id=allocation_id,
    )

    for key, value in update_data.items():
        setattr(db_allocation, key, value)

    db.commit()
    db.refresh(db_allocation)
    return db_allocation
