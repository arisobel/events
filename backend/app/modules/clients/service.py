"""Clients module - service layer."""
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.modules.events.models import Event
from app.modules.guests.models import Guest, GuestGroup

from . import models, schemas


# ---- Client CRUD ----
def list_clients(db: Session, search: Optional[str] = None) -> List[models.Client]:
    query = db.query(models.Client)
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Client.f_name.ilike(like),
                models.Client.f_document.ilike(like),
                models.Client.f_email.ilike(like),
                models.Client.f_phone.ilike(like),
            )
        )
    return query.order_by(models.Client.f_name).all()


def get_client(db: Session, client_id: int) -> Optional[models.Client]:
    return db.query(models.Client).filter(models.Client.id == client_id).first()


def create_client(db: Session, client: schemas.ClientCreate) -> models.Client:
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


def update_client(
    db: Session, client_id: int, client: schemas.ClientUpdate
) -> Optional[models.Client]:
    db_client = get_client(db, client_id)
    if not db_client:
        return None
    for key, value in client.model_dump(exclude_unset=True).items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client


def delete_client(db: Session, client_id: int) -> bool:
    db_client = get_client(db, client_id)
    if not db_client:
        return False

    # desliga as referências na operação por evento antes de remover (evita FK pendente)
    person_ids = [p.id for p in db_client.persons]
    if person_ids:
        db.query(Guest).filter(Guest.f_person_id.in_(person_ids)).update(
            {Guest.f_person_id: None}, synchronize_session=False
        )
    db.query(GuestGroup).filter(GuestGroup.f_client_id == client_id).update(
        {GuestGroup.f_client_id: None}, synchronize_session=False
    )

    db.delete(db_client)  # cascade remove as pessoas
    db.commit()
    return True


# ---- Person CRUD ----
def get_client_persons(db: Session, client_id: int) -> List[models.Person]:
    return db.query(models.Person).filter(models.Person.f_client_id == client_id).all()


def get_person(db: Session, client_id: int, person_id: int) -> Optional[models.Person]:
    return (
        db.query(models.Person)
        .filter(models.Person.id == person_id, models.Person.f_client_id == client_id)
        .first()
    )


def create_person(
    db: Session, client_id: int, person: schemas.PersonCreate
) -> models.Person:
    db_person = models.Person(**person.model_dump(), f_client_id=client_id)
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person


def update_person(
    db: Session, client_id: int, person_id: int, person: schemas.PersonUpdate
) -> Optional[models.Person]:
    db_person = get_person(db, client_id, person_id)
    if not db_person:
        return None
    for key, value in person.model_dump(exclude_unset=True).items():
        setattr(db_person, key, value)
    db.commit()
    db.refresh(db_person)
    return db_person


def delete_person(db: Session, client_id: int, person_id: int) -> bool:
    db_person = get_person(db, client_id, person_id)
    if not db_person:
        return False
    db.query(Guest).filter(Guest.f_person_id == person_id).update(
        {Guest.f_person_id: None}, synchronize_session=False
    )
    db.delete(db_person)
    db.commit()
    return True


# ---- Participação por evento ----
def get_client_events(db: Session, client_id: int) -> List[schemas.ClientEventLink]:
    rows = (
        db.query(GuestGroup, Event)
        .join(Event, Event.id == GuestGroup.f_event_id)
        .filter(GuestGroup.f_client_id == client_id)
        .order_by(Event.f_start_date.desc())
        .all()
    )
    return [
        schemas.ClientEventLink(
            event_id=event.id,
            event_name=event.f_name,
            group_id=group.id,
            group_name=group.f_name,
        )
        for group, event in rows
    ]


def import_client_to_event(
    db: Session, client_id: int, event_id: int
) -> Optional[schemas.ImportClientToEventResult]:
    """Cria um grupo no evento a partir do cliente, copiando as pessoas como hóspedes."""
    client = get_client(db, client_id)
    if not client:
        return None
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise ValueError("Event not found")

    group = GuestGroup(
        f_event_id=event_id,
        f_client_id=client.id,
        f_name=client.f_name,
        f_group_type=client.f_client_type,
        f_nationality=client.f_nationality,
        f_phone=client.f_phone,
        f_email=client.f_email,
        f_notes=client.f_notes,
    )
    db.add(group)
    db.flush()  # garante group.id para vincular os hóspedes

    persons = get_client_persons(db, client_id)
    for person in persons:
        db.add(
            Guest(
                f_group_id=group.id,
                f_person_id=person.id,
                f_full_name=person.f_full_name,
                f_gender=person.f_gender,
                f_birth_date=person.f_birth_date,
                f_document=person.f_document,
                f_phone=person.f_phone,
                f_email=person.f_email,
                f_is_group_leader=person.f_is_primary,
                f_notes=person.f_notes,
            )
        )

    db.commit()
    db.refresh(group)
    return schemas.ImportClientToEventResult(group_id=group.id, persons_imported=len(persons))
