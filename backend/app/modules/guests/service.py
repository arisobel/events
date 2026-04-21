"""Guests module - service layer."""
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas

def get_event_groups(db: Session, event_id: int) -> List[models.GuestGroup]:
    return db.query(models.GuestGroup).filter(models.GuestGroup.f_event_id == event_id).all()

def create_guest_group(db: Session, group: schemas.GuestGroupCreate) -> models.GuestGroup:
    db_group = models.GuestGroup(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group
