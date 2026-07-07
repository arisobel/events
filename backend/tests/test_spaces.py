"""Fatia 1 do bloco Facilities (decisão 2026-07-07): CRUD de espaços do hotel."""
from datetime import date

import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.modules.events import models as event_models
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service


def _create_hotel_with_space(db_session: Session):
    hotel = hotel_service.create_hotel(
        db_session,
        hotel_schemas.HotelCreate(f_name="Grand Palace", f_city="Miami"),
    )
    space = hotel_service.create_hotel_space(
        db_session,
        hotel_schemas.HotelSpaceCreate(
            f_hotel_id=hotel.id,
            f_name="Salão Jequitibás",
            f_space_type="salao_refeicao",
            f_capacity=200,
            f_floor="1",
        ),
    )
    return hotel, space


def test_create_and_list_spaces(db_session: Session) -> None:
    hotel, space = _create_hotel_with_space(db_session)

    spaces = hotel_service.get_hotel_spaces(db_session, hotel.id)
    assert len(spaces) == 1
    assert spaces[0].id == space.id
    assert spaces[0].f_name == "Salão Jequitibás"
    assert spaces[0].f_space_type == "salao_refeicao"
    assert spaces[0].f_capacity == 200


def test_space_type_outside_vocabulary_rejected() -> None:
    with pytest.raises(ValidationError):
        hotel_schemas.HotelSpaceCreate(
            f_hotel_id=1,
            f_name="Espaço X",
            f_space_type="ballroom",  # fora do vocabulário do domínio
        )


def test_update_space_full_fields(db_session: Session) -> None:
    hotel, space = _create_hotel_with_space(db_session)

    updated = hotel_service.update_hotel_space(
        db_session,
        hotel.id,
        space.id,
        hotel_schemas.HotelSpaceUpdate(
            f_name="Sinagoga Central",
            f_space_type="sinagoga",
            f_capacity=350,
            f_floor="2",
            f_block="B",
            f_notes="Aron Kodesh instalado",
        ),
    )

    assert updated is not None
    assert updated.f_name == "Sinagoga Central"
    assert updated.f_space_type == "sinagoga"
    assert updated.f_capacity == 350
    assert updated.f_floor == "2"
    assert updated.f_block == "B"
    assert updated.f_notes == "Aron Kodesh instalado"


def test_update_space_partial_keeps_other_fields(db_session: Session) -> None:
    hotel, space = _create_hotel_with_space(db_session)

    updated = hotel_service.update_hotel_space(
        db_session,
        hotel.id,
        space.id,
        hotel_schemas.HotelSpaceUpdate(f_capacity=250),
    )

    assert updated is not None
    assert updated.f_capacity == 250
    assert updated.f_name == "Salão Jequitibás"  # inalterado
    assert updated.f_space_type == "salao_refeicao"  # inalterado


def test_update_space_wrong_hotel_returns_none(db_session: Session) -> None:
    hotel, space = _create_hotel_with_space(db_session)

    assert hotel_service.update_hotel_space(
        db_session,
        hotel.id + 1,
        space.id,
        hotel_schemas.HotelSpaceUpdate(f_capacity=10),
    ) is None


def test_delete_space(db_session: Session) -> None:
    hotel, space = _create_hotel_with_space(db_session)

    assert hotel_service.delete_hotel_space(db_session, hotel.id, space.id) is True
    assert hotel_service.get_hotel_spaces(db_session, hotel.id) == []


def test_delete_space_missing_returns_none(db_session: Session) -> None:
    hotel, _ = _create_hotel_with_space(db_session)
    assert hotel_service.delete_hotel_space(db_session, hotel.id, 999) is None


def test_delete_space_referenced_by_kitchen_blocked(db_session: Session) -> None:
    hotel, space = _create_hotel_with_space(db_session)
    hotel_service.create_hotel_kitchen(
        db_session,
        hotel_schemas.HotelKitchenCreate(
            f_hotel_id=hotel.id,
            f_space_id=space.id,
            f_name="Cozinha Carne",
            f_kitchen_type="meat",
        ),
    )

    with pytest.raises(ValueError, match="kitchens"):
        hotel_service.delete_hotel_space(db_session, hotel.id, space.id)

    # espaço permanece
    assert len(hotel_service.get_hotel_spaces(db_session, hotel.id)) == 1


def test_delete_space_referenced_by_event_space_blocked(db_session: Session) -> None:
    hotel, space = _create_hotel_with_space(db_session)
    event = event_models.Event(
        f_hotel_id=hotel.id,
        f_name="Pessach 2027",
        f_start_date=date(2027, 4, 10),
        f_end_date=date(2027, 4, 20),
    )
    db_session.add(event)
    db_session.commit()
    db_session.add(
        event_models.EventSpace(
            f_event_id=event.id,
            f_space_id=space.id,
            f_usage_type="sinagoga",
        )
    )
    db_session.commit()

    with pytest.raises(ValueError, match="event spaces"):
        hotel_service.delete_hotel_space(db_session, hotel.id, space.id)
