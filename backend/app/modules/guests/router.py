"""Guests module - FastAPI routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas

router = APIRouter(tags=["Guests"])


@router.get("/events/{event_id}/groups", response_model=List[schemas.GuestGroupResponse])
def list_guest_groups(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return service.get_event_groups(db, event_id)


@router.post("/events/{event_id}/groups", response_model=schemas.GuestGroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    event_id: int,
    group: schemas.GuestGroupBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    group_create = schemas.GuestGroupCreate(**group.model_dump(), f_event_id=event_id)
    return service.create_guest_group(db, group_create)


@router.get("/events/{event_id}/groups/{group_id}/guests", response_model=List[schemas.GuestResponse])
def list_group_guests(
    event_id: int,
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    group = service.get_event_group(db, event_id, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found for event")
    return service.get_group_guests(db, event_id, group_id)


@router.post(
    "/events/{event_id}/groups/{group_id}/guests",
    response_model=schemas.GuestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_group_guest(
    event_id: int,
    group_id: int,
    guest: schemas.GuestInputBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    guest_create = schemas.GuestCreate(**guest.model_dump(), f_group_id=group_id)
    try:
        return service.create_guest(db, event_id, group_id, guest_create)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/events/{event_id}/groups/{group_id}", response_model=schemas.GuestGroupResponse)
def get_group(
    event_id: int,
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    group = service.get_event_group(db, event_id, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found for event")
    return group


@router.get("/events/{event_id}/groups/{group_id}/guests/{guest_id}", response_model=schemas.GuestResponse)
def get_guest(
    event_id: int,
    group_id: int,
    guest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    guest = service.get_group_guest(db, event_id, group_id, guest_id)
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found for group")
    return guest


@router.put("/events/{event_id}/groups/{group_id}", response_model=schemas.GuestGroupResponse)
def update_group(
    event_id: int,
    group_id: int,
    group: schemas.GuestGroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    updated_group = service.update_guest_group(db, event_id, group_id, group)
    if not updated_group:
        raise HTTPException(status_code=404, detail="Group not found for event")
    return updated_group


@router.put("/events/{event_id}/groups/{group_id}/guests/{guest_id}", response_model=schemas.GuestResponse)
def update_guest(
    event_id: int,
    group_id: int,
    guest_id: int,
    guest: schemas.GuestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    updated_guest = service.update_guest(db, event_id, group_id, guest_id, guest)
    if not updated_guest:
        raise HTTPException(status_code=404, detail="Guest not found for group")
    return updated_guest


@router.delete("/events/{event_id}/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    event_id: int,
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        deleted = service.delete_guest_group(db, event_id, group_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not deleted:
        raise HTTPException(status_code=404, detail="Group not found for event")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/events/{event_id}/groups/{group_id}/guests/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guest(
    event_id: int,
    group_id: int,
    guest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    deleted = service.delete_guest(db, event_id, group_id, guest_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Guest not found for group")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/events/{event_id}/groups/{group_id}/reservations", response_model=List[schemas.ReservationResponse])
def list_group_reservations(
    event_id: int,
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    group = service.get_event_group(db, event_id, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found for event")
    return service.get_group_reservations(db, event_id, group_id)


@router.post(
    "/events/{event_id}/groups/{group_id}/reservations",
    response_model=schemas.ReservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_group_reservation(
    event_id: int,
    group_id: int,
    reservation: schemas.ReservationBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    reservation_create = schemas.ReservationCreate(
        **reservation.model_dump(),
        f_event_id=event_id,
        f_group_id=group_id,
    )
    try:
        return service.create_reservation(db, event_id, group_id, reservation_create)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/reservations/{reservation_id}", response_model=schemas.ReservationResponse)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    reservation = service.get_reservation(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@router.put("/reservations/{reservation_id}", response_model=schemas.ReservationResponse)
def update_reservation(
    reservation_id: int,
    reservation: schemas.ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        updated_reservation = service.update_reservation(db, reservation_id, reservation)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not updated_reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return updated_reservation
