import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.guests import schemas as guest_schemas
from app.modules.guests import service as guest_service
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service
from app.modules.rooms import schemas as room_schemas
from app.modules.rooms import service as room_service


def create_hotel_event_and_room(db_session: Session) -> tuple[int, int, int]:
    hotel = hotel_service.create_hotel(
        db_session,
        hotel_schemas.HotelCreate(
            f_name="Grand Palace",
            f_city="Miami",
            f_state="FL",
            f_country="USA",
        ),
    )
    room = hotel_service.create_hotel_room(
        db_session,
        hotel_schemas.HotelRoomCreate(
            f_hotel_id=hotel.id,
            f_room_number="214",
            f_room_type="family",
            f_capacity=4,
        ),
    )
    event = event_service.create_event(
        db_session,
        event_schemas.EventCreate(
            f_hotel_id=hotel.id,
            f_name="Pessach 2026",
            f_event_type="holiday",
            f_start_date="2026-04-01",
            f_end_date="2026-04-10",
        ),
    )
    return hotel.id, room.id, event.id


def test_create_group_reservation_and_allocation(db_session: Session) -> None:
    _, room_id, event_id = create_hotel_event_and_room(db_session)

    group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(
            f_event_id=event_id,
            f_name="Cohen Family",
            f_group_type="family",
            f_phone="+1-555-0100",
        ),
    )
    groups = guest_service.get_event_groups(db_session, event_id)
    assert len(groups) == 1

    reservation = guest_service.create_reservation(
        db_session,
        event_id,
        group.id,
        guest_schemas.ReservationCreate(
            f_event_id=event_id,
            f_group_id=group.id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
            f_package_type="first_days",
            f_status="confirmed",
            f_total_guests=4,
        ),
    )

    allocation = room_service.create_room_allocation(
        db_session,
        room_schemas.RoomAllocationCreate(
            f_reservation_id=reservation.id,
            f_room_id=room_id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
            f_notes="Near elevator",
        ),
    )

    assert allocation.id is not None
    assert guest_service.get_reservation(db_session, reservation.id) is not None
    assert len(room_service.get_reservation_allocations(db_session, reservation.id)) == 1


def test_room_allocation_conflict_raises_error(db_session: Session) -> None:
    _, room_id, event_id = create_hotel_event_and_room(db_session)

    first_group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(f_event_id=event_id, f_name="Levi Family"),
    )
    second_group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(f_event_id=event_id, f_name="Mizrahi Family"),
    )

    first_reservation = guest_service.create_reservation(
        db_session,
        event_id,
        first_group.id,
        guest_schemas.ReservationCreate(
            f_event_id=event_id,
            f_group_id=first_group.id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
            f_status="confirmed",
            f_total_guests=2,
        ),
    )
    second_reservation = guest_service.create_reservation(
        db_session,
        event_id,
        second_group.id,
        guest_schemas.ReservationCreate(
            f_event_id=event_id,
            f_group_id=second_group.id,
            f_start_date="2026-04-03",
            f_end_date="2026-04-06",
            f_status="confirmed",
            f_total_guests=2,
        ),
    )

    room_service.create_room_allocation(
        db_session,
        room_schemas.RoomAllocationCreate(
            f_reservation_id=first_reservation.id,
            f_room_id=room_id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
        ),
    )

    with pytest.raises(ValueError) as exc_info:
        room_service.create_room_allocation(
            db_session,
            room_schemas.RoomAllocationCreate(
                f_reservation_id=second_reservation.id,
                f_room_id=room_id,
                f_start_date="2026-04-04",
                f_end_date="2026-04-06",
            ),
        )

    assert str(exc_info.value) == "Room allocation conflicts with an existing allocation"


def test_guest_crud_and_group_leader_switch(db_session: Session) -> None:
    _, _, event_id = create_hotel_event_and_room(db_session)

    group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(
            f_event_id=event_id,
            f_name="USA Group",
            f_group_type="international",
            f_notes="Leader was previously tracked in notes",
        ),
    )

    first_guest = guest_service.create_guest(
        db_session,
        event_id,
        group.id,
        guest_schemas.GuestCreate(
          f_group_id=group.id,
          f_full_name="Jacob Goldberg",
          f_guest_type="staff",
          f_gender="Male",
          f_phone="+1-555-1000",
          f_is_group_leader=True,
        ),
    )
    second_guest = guest_service.create_guest(
        db_session,
        event_id,
        group.id,
        guest_schemas.GuestCreate(
          f_group_id=group.id,
          f_full_name="Sarah Cohen",
          f_guest_type="adult",
          f_gender="female",
          f_is_group_leader=False,
        ),
    )

    guests = guest_service.get_group_guests(db_session, event_id, group.id)
    assert len(guests) == 2
    assert sum(1 for guest in guests if guest.f_is_group_leader) == 1
    assert any(guest.id == first_guest.id and guest.f_is_group_leader for guest in guests)

    updated_guest = guest_service.update_guest(
        db_session,
        event_id,
        group.id,
        second_guest.id,
        guest_schemas.GuestUpdate(
            f_guest_type="staff",
            f_is_group_leader=True,
        ),
    )

    assert updated_guest is not None

    refreshed_guests = guest_service.get_group_guests(db_session, event_id, group.id)
    assert sum(1 for guest in refreshed_guests if guest.f_is_group_leader) == 1
    assert any(guest.id == second_guest.id and guest.f_is_group_leader for guest in refreshed_guests)
    assert any(guest.id == first_guest.id and not guest.f_is_group_leader for guest in refreshed_guests)
    assert first_guest.f_gender == "male"
    assert updated_guest.f_guest_type == "staff"


def test_guest_schema_normalizes_supported_enum_values() -> None:
    guest = guest_schemas.GuestCreate(
        f_group_id=1,
        f_full_name="Moshe Adler",
        f_gender="Female",
        f_guest_type="Staff",
    )

    assert guest.f_gender == "female"
    assert guest.f_guest_type == "staff"


def test_guest_schema_rejects_invalid_enum_values() -> None:
    with pytest.raises(ValidationError):
        guest_schemas.GuestCreate(
            f_group_id=1,
            f_full_name="Invalid Guest",
            f_gender="unknown",
        )

    with pytest.raises(ValidationError):
        guest_schemas.GuestUpdate(
            f_guest_type="leader",
        )
