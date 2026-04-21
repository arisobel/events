"""Events module - service layer."""
from sqlalchemy.orm import Session
from typing import Optional, List
from . import models, schemas


def get_event(db: Session, event_id: int) -> Optional[models.Event]:
    return db.query(models.Event).filter(models.Event.id == event_id).first()


def get_events(db: Session, skip: int = 0, limit: int = 100) -> List[models.Event]:
    return db.query(models.Event).offset(skip).limit(limit).all()


def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
    db_event = models.Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: int, event: schemas.EventUpdate) -> Optional[models.Event]:
    db_event = get_event(db, event_id)
    if not db_event:
        return None
    
    for key, value in event.model_dump(exclude_unset=True).items():
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
