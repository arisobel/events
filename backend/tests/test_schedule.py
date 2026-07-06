from datetime import date

import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service
from app.modules.schedule import schemas as schedule_schemas
from app.modules.schedule import service as schedule_service


def _create_event(db_session: Session) -> int:
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
    return event.id


def _activity(**overrides) -> schedule_schemas.ActivityCreate:
    data = dict(
        f_title="Shacharit",
        f_activity_type="religioso",
        f_audience="all",
        f_date=date(2027, 4, 2),
        f_start_time="07:45",
    )
    data.update(overrides)
    return schedule_schemas.ActivityCreate(**data)


def test_activity_crud(db_session: Session) -> None:
    event_id = _create_event(db_session)

    activity = schedule_service.create_activity(db_session, event_id, _activity())
    assert activity.id is not None
    assert activity.f_event_id == event_id
    assert activity.f_start_time == "07:45"
    assert activity.f_activity_type == "religioso"

    fetched = schedule_service.get_activity(db_session, activity.id)
    assert fetched is not None and fetched.f_title == "Shacharit"

    updated = schedule_service.update_activity(
        db_session,
        activity.id,
        schedule_schemas.ActivityUpdate(f_location="Sinagoga", f_end_time="08:30"),
    )
    assert updated is not None
    assert updated.f_location == "Sinagoga"
    assert updated.f_end_time == "08:30"

    assert schedule_service.delete_activity(db_session, activity.id) is True
    assert schedule_service.get_activity(db_session, activity.id) is None


def test_activities_ordered_and_filtered_by_day(db_session: Session) -> None:
    event_id = _create_event(db_session)

    schedule_service.create_activity(db_session, event_id, _activity(f_title="Mincha", f_start_time="17:45"))
    schedule_service.create_activity(db_session, event_id, _activity(f_title="Shacharit", f_start_time="07:45"))
    schedule_service.create_activity(
        db_session, event_id, _activity(f_title="Almoço", f_activity_type="refeicao", f_start_time="13:00")
    )
    # outro dia
    schedule_service.create_activity(
        db_session, event_id, _activity(f_title="Arvit", f_date=date(2027, 4, 3), f_start_time="19:00")
    )

    day2 = schedule_service.get_event_activities(db_session, event_id, day=date(2027, 4, 2))
    assert [a.f_title for a in day2] == ["Shacharit", "Almoço", "Mincha"]  # ordenado por horário

    all_acts = schedule_service.get_event_activities(db_session, event_id)
    assert len(all_acts) == 4

    meals = schedule_service.get_event_activities(db_session, event_id, activity_type="refeicao")
    assert len(meals) == 1 and meals[0].f_title == "Almoço"


def test_audience_filter_includes_all(db_session: Session) -> None:
    event_id = _create_event(db_session)
    schedule_service.create_activity(db_session, event_id, _activity(f_title="Geral", f_audience="all"))
    schedule_service.create_activity(
        db_session, event_id, _activity(f_title="Infantil", f_activity_type="infantil", f_audience="children")
    )
    schedule_service.create_activity(
        db_session, event_id, _activity(f_title="Jovens", f_audience="youth")
    )

    # filtrar por 'children' traz o público específico + os marcados como 'all'
    children = schedule_service.get_event_activities(db_session, event_id, audience="children")
    titles = {a.f_title for a in children}
    assert titles == {"Geral", "Infantil"}


def test_invalid_time_rejected() -> None:
    with pytest.raises(ValidationError):
        _activity(f_start_time="25:00")
    with pytest.raises(ValidationError):
        _activity(f_start_time="7:45")  # falta zero à esquerda
