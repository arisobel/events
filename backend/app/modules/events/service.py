"""Events module - service layer."""
from sqlalchemy.orm import Session
from typing import Optional, List
from . import models, schemas


def get_event(db: Session, event_id: int) -> Optional[models.Event]:
    return db.query(models.Event).filter(models.Event.id == event_id).first()


def get_events(db: Session, skip: int = 0, limit: int = 100) -> List[models.Event]:
    return db.query(models.Event).offset(skip).limit(limit).all()


def _clear_entry_default(db: Session, exclude_event_id: Optional[int] = None) -> None:
    query = db.query(models.Event).filter(models.Event.f_is_entry_default.is_(True))
    if exclude_event_id is not None:
        query = query.filter(models.Event.id != exclude_event_id)
    for event in query.all():
        event.f_is_entry_default = False


def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
    if event.f_start_date > event.f_end_date:
        raise ValueError("Event start date must be before or equal to end date")

    db_event = models.Event(**event.model_dump())
    if db_event.f_is_entry_default:
        _clear_entry_default(db)

    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: int, event: schemas.EventUpdate) -> Optional[models.Event]:
    db_event = get_event(db, event_id)
    if not db_event:
        return None

    update_data = event.model_dump(exclude_unset=True)
    start_date = update_data.get("f_start_date", db_event.f_start_date)
    end_date = update_data.get("f_end_date", db_event.f_end_date)
    if start_date > end_date:
        raise ValueError("Event start date must be before or equal to end date")

    if update_data.get("f_is_entry_default") is True:
        _clear_entry_default(db, exclude_event_id=event_id)

    for key, value in update_data.items():
        setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)
    return db_event


def get_event_periods(db: Session, event_id: int) -> List[models.EventPeriod]:
    return db.query(models.EventPeriod).filter(models.EventPeriod.f_event_id == event_id).order_by(models.EventPeriod.f_sort_order).all()


def create_event_period(db: Session, period: schemas.EventPeriodCreate) -> models.EventPeriod:
    db_period = models.EventPeriod(**period.model_dump())
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    return db_period
