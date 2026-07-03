import pytest
from sqlalchemy.orm import Session

from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service


def _create_event(db_session: Session, name: str = "Pessach 2026", **overrides):
    hotel = hotel_service.create_hotel(
        db_session,
        hotel_schemas.HotelCreate(f_name=f"Hotel {name}"),
    )
    payload = {
        "f_hotel_id": hotel.id,
        "f_name": name,
        "f_start_date": "2026-04-01",
        "f_end_date": "2026-04-10",
        **overrides,
    }
    return event_service.create_event(db_session, event_schemas.EventCreate(**payload))


def test_update_event_dates_and_fields(db_session: Session) -> None:
    event = _create_event(db_session)

    updated = event_service.update_event(
        db_session,
        event.id,
        event_schemas.EventUpdate(
            f_start_date="2026-04-02",
            f_end_date="2026-04-12",
            f_event_type="holiday",
            f_expected_families=40,
        ),
    )

    assert updated is not None
    assert str(updated.f_start_date) == "2026-04-02"
    assert str(updated.f_end_date) == "2026-04-12"
    assert updated.f_event_type == "holiday"
    assert updated.f_expected_families == 40
    assert updated.f_name == "Pessach 2026"  # inalterado


def test_update_event_rejects_inverted_dates(db_session: Session) -> None:
    event = _create_event(db_session)

    with pytest.raises(ValueError):
        event_service.update_event(
            db_session,
            event.id,
            event_schemas.EventUpdate(f_end_date="2026-03-01"),
        )


def test_create_event_rejects_inverted_dates(db_session: Session) -> None:
    hotel = hotel_service.create_hotel(db_session, hotel_schemas.HotelCreate(f_name="H"))

    with pytest.raises(ValueError):
        event_service.create_event(
            db_session,
            event_schemas.EventCreate(
                f_hotel_id=hotel.id,
                f_name="Invalid",
                f_start_date="2026-04-10",
                f_end_date="2026-04-01",
            ),
        )


def test_entry_default_is_exclusive(db_session: Session) -> None:
    first = _create_event(db_session, name="Pessach", f_is_entry_default=True)
    assert first.f_is_entry_default is True

    second = _create_event(db_session, name="Sucot", f_is_entry_default=True)
    db_session.refresh(first)

    assert second.f_is_entry_default is True
    assert first.f_is_entry_default is False

    event_service.update_event(
        db_session,
        first.id,
        event_schemas.EventUpdate(f_is_entry_default=True),
    )
    db_session.refresh(second)

    assert second.f_is_entry_default is False
