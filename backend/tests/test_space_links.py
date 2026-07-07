"""Fatia 2 do bloco Facilities (2026-07-07): Activity → Space e Task → Space."""
from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service
from app.modules.schedule import schemas as schedule_schemas
from app.modules.schedule import service as schedule_service
from app.modules.tasks import schemas as task_schemas
from app.modules.tasks import service as task_service


def _setup(db_session: Session):
    """Hotel + evento + espaço do hotel; retorna (event_id, space_id)."""
    hotel = hotel_service.create_hotel(
        db_session, hotel_schemas.HotelCreate(f_name="Grand Palace", f_city="Miami")
    )
    event = event_service.create_event(
        db_session,
        event_schemas.EventCreate(
            f_hotel_id=hotel.id,
            f_name="Pessach 2027",
            f_event_type="holiday",
            f_start_date="2027-04-01",
            f_end_date="2027-04-10",
        ),
    )
    space = hotel_service.create_hotel_space(
        db_session,
        hotel_schemas.HotelSpaceCreate(
            f_hotel_id=hotel.id, f_name="Sinagoga Central", f_space_type="sinagoga"
        ),
    )
    return event.id, space.id


def _other_hotel_space(db_session: Session) -> int:
    other = hotel_service.create_hotel(
        db_session, hotel_schemas.HotelCreate(f_name="Outro Hotel")
    )
    space = hotel_service.create_hotel_space(
        db_session,
        hotel_schemas.HotelSpaceCreate(
            f_hotel_id=other.id, f_name="Piscina do Outro", f_space_type="piscina"
        ),
    )
    return space.id


def test_activity_with_space_persists_and_resolves_name(db_session: Session) -> None:
    event_id, space_id = _setup(db_session)

    activity = schedule_service.create_activity(
        db_session,
        event_id,
        schedule_schemas.ActivityCreate(
            f_title="Shacharit",
            f_activity_type="religioso",
            f_space_id=space_id,
            f_date=date(2027, 4, 2),
            f_start_time="07:45",
        ),
    )

    assert activity.f_space_id == space_id
    assert activity.space_name == "Sinagoga Central"
    # serialização da resposta resolve o nome do espaço
    payload = schedule_schemas.ActivityResponse.model_validate(activity)
    assert payload.space_name == "Sinagoga Central"


def test_activity_space_from_other_hotel_rejected(db_session: Session) -> None:
    event_id, _ = _setup(db_session)
    foreign_space_id = _other_hotel_space(db_session)

    with pytest.raises(ValueError, match="does not belong"):
        schedule_service.create_activity(
            db_session,
            event_id,
            schedule_schemas.ActivityCreate(
                f_title="Jantar",
                f_space_id=foreign_space_id,
                f_date=date(2027, 4, 2),
                f_start_time="19:00",
            ),
        )


def test_activity_update_space_and_clear(db_session: Session) -> None:
    event_id, space_id = _setup(db_session)
    activity = schedule_service.create_activity(
        db_session,
        event_id,
        schedule_schemas.ActivityCreate(
            f_title="Palestra", f_date=date(2027, 4, 3), f_start_time="17:00"
        ),
    )
    assert activity.f_space_id is None

    updated = schedule_service.update_activity(
        db_session, activity.id, schedule_schemas.ActivityUpdate(f_space_id=space_id)
    )
    assert updated is not None and updated.f_space_id == space_id

    cleared = schedule_service.update_activity(
        db_session, activity.id, schedule_schemas.ActivityUpdate(f_space_id=None)
    )
    assert cleared is not None and cleared.f_space_id is None


def test_activity_update_missing_space_rejected(db_session: Session) -> None:
    event_id, _ = _setup(db_session)
    activity = schedule_service.create_activity(
        db_session,
        event_id,
        schedule_schemas.ActivityCreate(
            f_title="Mincha", f_date=date(2027, 4, 3), f_start_time="18:30"
        ),
    )

    with pytest.raises(ValueError, match="not found"):
        schedule_service.update_activity(
            db_session, activity.id, schedule_schemas.ActivityUpdate(f_space_id=9999)
        )


def test_task_with_space_persists_and_resolves_name(db_session: Session) -> None:
    event_id, space_id = _setup(db_session)

    task = task_service.create_task(
        db_session,
        task_schemas.TaskCreate(
            f_event_id=event_id,
            f_title="Montar cadeiras da sinagoga",
            f_task_type="setup",
            f_space_id=space_id,
        ),
    )

    assert task.f_space_id == space_id
    assert task.space_name == "Sinagoga Central"
    payload = task_schemas.TaskResponse.model_validate(task)
    assert payload.space_name == "Sinagoga Central"


def test_task_space_from_other_hotel_rejected(db_session: Session) -> None:
    event_id, _ = _setup(db_session)
    foreign_space_id = _other_hotel_space(db_session)

    with pytest.raises(ValueError, match="does not belong"):
        task_service.create_task(
            db_session,
            task_schemas.TaskCreate(
                f_event_id=event_id,
                f_title="Limpar piscina errada",
                f_space_id=foreign_space_id,
            ),
        )


def test_task_without_space_still_works(db_session: Session) -> None:
    event_id, _ = _setup(db_session)

    task = task_service.create_task(
        db_session,
        task_schemas.TaskCreate(f_event_id=event_id, f_title="Task sem espaço"),
    )
    assert task.f_space_id is None
    assert task.space_name is None
