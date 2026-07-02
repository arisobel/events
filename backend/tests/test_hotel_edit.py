from decimal import Decimal

from sqlalchemy.orm import Session

from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service


def _create_hotel_with_room(db_session: Session):
    hotel = hotel_service.create_hotel(
        db_session,
        hotel_schemas.HotelCreate(f_name="Grand Palace", f_city="Miami"),
    )
    room = hotel_service.create_hotel_room(
        db_session,
        hotel_schemas.HotelRoomCreate(
            f_hotel_id=hotel.id,
            f_room_number="101",
            f_room_type="standard",
            f_capacity=2,
        ),
    )
    return hotel, room


def test_update_hotel_full_fields(db_session: Session) -> None:
    hotel, _ = _create_hotel_with_room(db_session)

    updated = hotel_service.update_hotel(
        db_session,
        hotel.id,
        hotel_schemas.HotelUpdate(
            f_name="Grand Palace Resort",
            f_city="Orlando",
            f_state="FL",
            f_country="USA",
            f_address="123 Palm Ave",
            f_notes="Renovado em 2026",
        ),
    )

    assert updated is not None
    assert updated.f_name == "Grand Palace Resort"
    assert updated.f_city == "Orlando"
    assert updated.f_state == "FL"
    assert updated.f_country == "USA"
    assert updated.f_address == "123 Palm Ave"
    assert updated.f_notes == "Renovado em 2026"


def test_update_hotel_partial_keeps_other_fields(db_session: Session) -> None:
    hotel, _ = _create_hotel_with_room(db_session)

    updated = hotel_service.update_hotel(
        db_session,
        hotel.id,
        hotel_schemas.HotelUpdate(f_phone="+1-555-9000"),
    )

    assert updated is not None
    assert updated.f_phone == "+1-555-9000"
    assert updated.f_city == "Miami"  # inalterado


def test_update_hotel_missing_returns_none(db_session: Session) -> None:
    assert hotel_service.update_hotel(
        db_session, 999, hotel_schemas.HotelUpdate(f_name="X")
    ) is None


def test_update_room_full_fields_including_price(db_session: Session) -> None:
    hotel, room = _create_hotel_with_room(db_session)

    updated = hotel_service.update_hotel_room(
        db_session,
        hotel.id,
        room.id,
        hotel_schemas.HotelRoomUpdate(
            f_room_number="201",
            f_room_type="suite",
            f_room_type_label="Suíte Família Premium",
            f_floor="2",
            f_block="A",
            f_capacity=4,
            f_price_per_night=Decimal("750.50"),
            f_status="maintenance",
            f_notes="Ar condicionado novo",
        ),
    )

    assert updated is not None
    assert updated.f_room_number == "201"
    assert updated.f_room_type == "suite"
    assert updated.f_room_type_label == "Suíte Família Premium"
    assert updated.f_floor == "2"
    assert updated.f_block == "A"
    assert updated.f_capacity == 4
    assert updated.f_price_per_night == Decimal("750.50")
    assert updated.f_status == "maintenance"
    assert updated.f_notes == "Ar condicionado novo"


def test_update_room_partial_keeps_other_fields(db_session: Session) -> None:
    hotel, room = _create_hotel_with_room(db_session)

    updated = hotel_service.update_hotel_room(
        db_session,
        hotel.id,
        room.id,
        hotel_schemas.HotelRoomUpdate(f_price_per_night=Decimal("300.00")),
    )

    assert updated is not None
    assert updated.f_price_per_night == Decimal("300.00")
    assert updated.f_room_number == "101"  # inalterado
    assert updated.f_capacity == 2  # inalterado


def test_update_room_wrong_hotel_returns_none(db_session: Session) -> None:
    hotel, room = _create_hotel_with_room(db_session)

    assert hotel_service.update_hotel_room(
        db_session,
        hotel.id + 1,
        room.id,
        hotel_schemas.HotelRoomUpdate(f_capacity=8),
    ) is None
