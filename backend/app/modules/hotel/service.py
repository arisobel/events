"""Hotel module - business logic service layer."""
from sqlalchemy.orm import Session
from typing import Optional, List
from . import models, schemas


# Hotel services
def get_hotel(db: Session, hotel_id: int) -> Optional[models.Hotel]:
    return db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()


def get_hotels(db: Session, skip: int = 0, limit: int = 100) -> List[models.Hotel]:
    return db.query(models.Hotel).filter(models.Hotel.f_is_active == 'T').offset(skip).limit(limit).all()


def create_hotel(db: Session, hotel: schemas.HotelCreate) -> models.Hotel:
    db_hotel = models.Hotel(**hotel.model_dump())
    db.add(db_hotel)
    db.commit()
    db.refresh(db_hotel)
    return db_hotel


def update_hotel(db: Session, hotel_id: int, hotel: schemas.HotelUpdate) -> Optional[models.Hotel]:
    db_hotel = get_hotel(db, hotel_id)
    if not db_hotel:
        return None
    
    update_data = hotel.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_hotel, key, value)
    
    db.commit()
    db.refresh(db_hotel)
    return db_hotel


# HotelSpace services
def get_hotel_spaces(db: Session, hotel_id: int) -> List[models.HotelSpace]:
    return db.query(models.HotelSpace).filter(models.HotelSpace.f_hotel_id == hotel_id).all()


def create_hotel_space(db: Session, space: schemas.HotelSpaceCreate) -> models.HotelSpace:
    db_space = models.HotelSpace(**space.model_dump())
    db.add(db_space)
    db.commit()
    db.refresh(db_space)
    return db_space


def get_hotel_space(db: Session, hotel_id: int, space_id: int) -> Optional[models.HotelSpace]:
    return (
        db.query(models.HotelSpace)
        .filter(models.HotelSpace.id == space_id, models.HotelSpace.f_hotel_id == hotel_id)
        .first()
    )


def update_hotel_space(
    db: Session,
    hotel_id: int,
    space_id: int,
    space: schemas.HotelSpaceUpdate,
) -> Optional[models.HotelSpace]:
    db_space = get_hotel_space(db, hotel_id, space_id)
    if not db_space:
        return None

    update_data = space.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_space, key, value)

    db.commit()
    db.refresh(db_space)
    return db_space


def delete_hotel_space(db: Session, hotel_id: int, space_id: int) -> Optional[bool]:
    """Remove um espaço. Retorna None se não existir; levanta ValueError se estiver em uso."""
    db_space = get_hotel_space(db, hotel_id, space_id)
    if not db_space:
        return None

    # Espaço referenciado não pode sumir — cozinhas, mesas e usos por evento apontam para ele
    from app.modules.events import models as event_models

    references = []
    if db.query(models.HotelKitchen).filter(models.HotelKitchen.f_space_id == space_id).first():
        references.append("kitchens")
    if db.query(models.HotelTable).filter(models.HotelTable.f_space_id == space_id).first():
        references.append("tables")
    if db.query(event_models.EventSpace).filter(event_models.EventSpace.f_space_id == space_id).first():
        references.append("event spaces")

    if references:
        raise ValueError(
            f"Space is in use by: {', '.join(references)}. Remove the references first."
        )

    db.delete(db_space)
    db.commit()
    return True


# HotelRoom services  
def get_hotel_rooms(db: Session, hotel_id: int) -> List[models.HotelRoom]:
    return db.query(models.HotelRoom).filter(models.HotelRoom.f_hotel_id == hotel_id).all()


def create_hotel_room(db: Session, room: schemas.HotelRoomCreate) -> models.HotelRoom:
    db_room = models.HotelRoom(**room.model_dump())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


def get_hotel_room(db: Session, hotel_id: int, room_id: int) -> Optional[models.HotelRoom]:
    return (
        db.query(models.HotelRoom)
        .filter(models.HotelRoom.id == room_id, models.HotelRoom.f_hotel_id == hotel_id)
        .first()
    )


def update_hotel_room(
    db: Session,
    hotel_id: int,
    room_id: int,
    room: schemas.HotelRoomUpdate,
) -> Optional[models.HotelRoom]:
    db_room = get_hotel_room(db, hotel_id, room_id)
    if not db_room:
        return None

    update_data = room.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_room, key, value)

    db.commit()
    db.refresh(db_room)
    return db_room


def update_room_status(db: Session, room_id: int, status: str) -> Optional[models.HotelRoom]:
    db_room = db.query(models.HotelRoom).filter(models.HotelRoom.id == room_id).first()
    if not db_room:
        return None

    db_room.f_status = status
    db.commit()
    db.refresh(db_room)
    return db_room


# HotelKitchen services
def get_hotel_kitchens(db: Session, hotel_id: int) -> List[models.HotelKitchen]:
    return db.query(models.HotelKitchen).filter(models.HotelKitchen.f_hotel_id == hotel_id).all()


def create_hotel_kitchen(db: Session, kitchen: schemas.HotelKitchenCreate) -> models.HotelKitchen:
    db_kitchen = models.HotelKitchen(**kitchen.model_dump())
    db.add(db_kitchen)
    db.commit()
    db.refresh(db_kitchen)
    return db_kitchen


# HotelTable services
def get_hotel_tables(db: Session, hotel_id: int) -> List[models.HotelTable]:
    return db.query(models.HotelTable).filter(models.HotelTable.f_hotel_id == hotel_id).all()


def create_hotel_table(db: Session, table: schemas.HotelTableCreate) -> models.HotelTable:
    db_table = models.HotelTable(**table.model_dump())
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table
