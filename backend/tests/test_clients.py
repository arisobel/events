import pytest
from sqlalchemy.orm import Session

from app.modules.clients import schemas as client_schemas
from app.modules.clients import service as client_service
from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.guests import schemas as guest_schemas
from app.modules.guests import service as guest_service
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service


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


def test_client_crud_and_nationality_normalized(db_session: Session) -> None:
    client = client_service.create_client(
        db_session,
        client_schemas.ClientCreate(f_name="Família Zellerkraut", f_client_type="family", f_nationality="br"),
    )
    assert client.id is not None
    assert client.f_nationality == "BR"  # normalizado para maiúsculo

    fetched = client_service.get_client(db_session, client.id)
    assert fetched is not None and fetched.f_name == "Família Zellerkraut"

    updated = client_service.update_client(
        db_session, client.id, client_schemas.ClientUpdate(f_phone="+5511999999999")
    )
    assert updated is not None and updated.f_phone == "+5511999999999"

    assert len(client_service.list_clients(db_session)) == 1
    assert len(client_service.list_clients(db_session, search="zeller")) == 1
    assert len(client_service.list_clients(db_session, search="cohen")) == 0

    assert client_service.delete_client(db_session, client.id) is True
    assert client_service.get_client(db_session, client.id) is None


def test_person_crud_under_client(db_session: Session) -> None:
    client = client_service.create_client(
        db_session, client_schemas.ClientCreate(f_name="Família Cohen")
    )
    person = client_service.create_person(
        db_session,
        client.id,
        client_schemas.PersonCreate(f_full_name="Michel Sobel", f_gender="Male", f_is_primary=True),
    )
    assert person.f_client_id == client.id
    assert person.f_gender == "male"  # normalizado

    persons = client_service.get_client_persons(db_session, client.id)
    assert len(persons) == 1

    updated = client_service.update_person(
        db_session, client.id, person.id, client_schemas.PersonUpdate(f_phone="123")
    )
    assert updated is not None and updated.f_phone == "123"

    assert client_service.delete_person(db_session, client.id, person.id) is True
    assert client_service.get_client_persons(db_session, client.id) == []


def test_import_client_to_event_creates_group_and_guests(db_session: Session) -> None:
    event_id = _create_event(db_session)
    client = client_service.create_client(
        db_session, client_schemas.ClientCreate(f_name="Família Zellerkraut", f_nationality="BR")
    )
    client_service.create_person(
        db_session, client.id, client_schemas.PersonCreate(f_full_name="Eva Zellerkraut", f_is_primary=True)
    )
    client_service.create_person(
        db_session, client.id, client_schemas.PersonCreate(f_full_name="Michel Sobel")
    )

    # antes de importar, cliente não participa de nenhum evento
    assert client_service.get_client_events(db_session, client.id) == []

    result = client_service.import_client_to_event(db_session, client.id, event_id)
    assert result is not None
    assert result.persons_imported == 2

    # o grupo criado carrega o vínculo com o cliente e a nacionalidade
    group = guest_service.get_event_group(db_session, event_id, result.group_id)
    assert group is not None
    assert group.f_client_id == client.id
    assert group.f_nationality == "BR"
    assert len(group.guests) == 2
    # a pessoa primária vira líder do grupo, e os hóspedes ficam ligados às pessoas raiz
    leaders = [g for g in group.guests if g.f_is_group_leader]
    assert len(leaders) == 1 and leaders[0].f_full_name == "Eva Zellerkraut"
    assert all(g.f_person_id is not None for g in group.guests)

    # agora o cliente participa de 1 evento
    events = client_service.get_client_events(db_session, client.id)
    assert len(events) == 1
    assert events[0].event_id == event_id
    assert events[0].group_id == result.group_id


def test_delete_client_unlinks_group(db_session: Session) -> None:
    event_id = _create_event(db_session)
    client = client_service.create_client(
        db_session, client_schemas.ClientCreate(f_name="Família Temp")
    )
    client_service.create_person(
        db_session, client.id, client_schemas.PersonCreate(f_full_name="Alguém")
    )
    result = client_service.import_client_to_event(db_session, client.id, event_id)
    assert result is not None

    # apagar o cliente não apaga o grupo do evento — apenas desliga o vínculo
    assert client_service.delete_client(db_session, client.id) is True
    group = guest_service.get_event_group(db_session, event_id, result.group_id)
    assert group is not None
    assert group.f_client_id is None
    assert all(g.f_person_id is None for g in group.guests)


def test_import_client_missing_client_returns_none(db_session: Session) -> None:
    event_id = _create_event(db_session)
    assert client_service.import_client_to_event(db_session, 999, event_id) is None


def test_promote_group_to_client(db_session: Session) -> None:
    event_id = _create_event(db_session)
    # cria um grupo com hóspedes direto no evento (sem cliente)
    group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(
            f_event_id=event_id, f_name="Família Cohen", f_group_type="family", f_nationality="AR"
        ),
    )
    guest_service.create_guest(
        db_session,
        event_id,
        group.id,
        guest_schemas.GuestCreate(f_group_id=group.id, f_full_name="Sara Cohen", f_is_group_leader=True),
    )
    guest_service.create_guest(
        db_session,
        event_id,
        group.id,
        guest_schemas.GuestCreate(f_group_id=group.id, f_full_name="David Cohen"),
    )

    client = client_service.promote_group_to_client(db_session, group.id)
    assert client.f_name == "Família Cohen"
    assert client.f_nationality == "AR"
    assert len(client.persons) == 2
    primary = [p for p in client.persons if p.f_is_primary]
    assert len(primary) == 1 and primary[0].f_full_name == "Sara Cohen"

    # o grupo agora aponta para o cliente e os hóspedes para as pessoas
    refreshed = guest_service.get_event_group(db_session, event_id, group.id)
    assert refreshed is not None
    assert refreshed.f_client_id == client.id
    assert all(g.f_person_id is not None for g in refreshed.guests)

    # promover de novo o mesmo grupo é rejeitado
    with pytest.raises(ValueError):
        client_service.promote_group_to_client(db_session, group.id)
