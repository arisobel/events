"""Guests module - service layer."""
from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


def get_event_groups(db: Session, event_id: int) -> List[models.GuestGroup]:
    return db.query(models.GuestGroup).filter(models.GuestGroup.f_event_id == event_id).all()


def get_event_group(db: Session, event_id: int, group_id: int) -> Optional[models.GuestGroup]:
    return (
        db.query(models.GuestGroup)
        .filter(models.GuestGroup.id == group_id, models.GuestGroup.f_event_id == event_id)
        .first()
    )


def create_guest_group(db: Session, group: schemas.GuestGroupCreate) -> models.GuestGroup:
    db_group = models.GuestGroup(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


def update_guest_group(
    db: Session,
    event_id: int,
    group_id: int,
    group: schemas.GuestGroupUpdate,
) -> Optional[models.GuestGroup]:
    db_group = get_event_group(db, event_id, group_id)
    if not db_group:
        return None

    for key, value in group.model_dump(exclude_unset=True).items():
        setattr(db_group, key, value)

    db.commit()
    db.refresh(db_group)
    return db_group


def delete_guest_group(db: Session, event_id: int, group_id: int) -> bool:
    db_group = get_event_group(db, event_id, group_id)
    if not db_group:
        return False
    if db_group.guests:
        raise ValueError("Cannot delete group with registered guests")
    if db_group.reservations:
        raise ValueError("Cannot delete group with active reservations")

    db.delete(db_group)
    db.commit()
    return True


def get_group_reservations(db: Session, event_id: int, group_id: int) -> List[models.Reservation]:
    return (
        db.query(models.Reservation)
        .filter(models.Reservation.f_event_id == event_id, models.Reservation.f_group_id == group_id)
        .all()
    )


def get_reservation(db: Session, reservation_id: int) -> Optional[models.Reservation]:
    return db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()


def get_group_guests(db: Session, event_id: int, group_id: int) -> List[models.Guest]:
    db_group = get_event_group(db, event_id, group_id)
    if not db_group:
        return []
    return db.query(models.Guest).filter(models.Guest.f_group_id == group_id).all()


def get_group_guest(
    db: Session,
    event_id: int,
    group_id: int,
    guest_id: int,
) -> Optional[models.Guest]:
    db_group = get_event_group(db, event_id, group_id)
    if not db_group:
        return None
    return (
        db.query(models.Guest)
        .filter(models.Guest.id == guest_id, models.Guest.f_group_id == group_id)
        .first()
    )


def _clear_group_leader(db: Session, group_id: int, exclude_guest_id: Optional[int] = None) -> None:
    query = db.query(models.Guest).filter(
        models.Guest.f_group_id == group_id,
        models.Guest.f_is_group_leader.is_(True),
    )
    if exclude_guest_id is not None:
        query = query.filter(models.Guest.id != exclude_guest_id)

    for guest in query.all():
        guest.f_is_group_leader = False


def create_guest(
    db: Session,
    event_id: int,
    group_id: int,
    guest: schemas.GuestCreate,
) -> models.Guest:
    db_group = get_event_group(db, event_id, group_id)
    if not db_group:
        raise ValueError("Group not found for event")

    db_guest = models.Guest(**guest.model_dump())
    if db_guest.f_is_group_leader:
        _clear_group_leader(db, group_id)

    db.add(db_guest)
    db.commit()
    db.refresh(db_guest)
    return db_guest


def update_guest(
    db: Session,
    event_id: int,
    group_id: int,
    guest_id: int,
    guest: schemas.GuestUpdate,
) -> Optional[models.Guest]:
    db_guest = get_group_guest(db, event_id, group_id, guest_id)
    if not db_guest:
        return None

    update_data = guest.model_dump(exclude_unset=True)
    if update_data.get("f_is_group_leader") is True:
        _clear_group_leader(db, group_id, exclude_guest_id=guest_id)

    for key, value in update_data.items():
        setattr(db_guest, key, value)

    db.commit()
    db.refresh(db_guest)
    return db_guest


def delete_guest(
    db: Session,
    event_id: int,
    group_id: int,
    guest_id: int,
) -> bool:
    db_guest = get_group_guest(db, event_id, group_id, guest_id)
    if not db_guest:
        return False

    db.delete(db_guest)
    db.commit()
    return True


def create_reservation(
    db: Session,
    event_id: int,
    group_id: int,
    reservation: schemas.ReservationCreate,
) -> models.Reservation:
    db_group = get_event_group(db, event_id, group_id)
    if not db_group:
        raise ValueError("Group not found for event")
    if reservation.f_start_date > reservation.f_end_date:
        raise ValueError("Reservation start date must be before or equal to end date")

    db_reservation = models.Reservation(**reservation.model_dump())
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def update_reservation(
    db: Session,
    reservation_id: int,
    reservation: schemas.ReservationUpdate,
) -> Optional[models.Reservation]:
    db_reservation = get_reservation(db, reservation_id)
    if not db_reservation:
        return None

    update_data = reservation.model_dump(exclude_unset=True)
    start_date = update_data.get("f_start_date", db_reservation.f_start_date)
    end_date = update_data.get("f_end_date", db_reservation.f_end_date)
    if start_date > end_date:
        raise ValueError("Reservation start date must be before or equal to end date")

    for key, value in update_data.items():
        setattr(db_reservation, key, value)

    db.commit()
    db.refresh(db_reservation)
    return db_reservation
