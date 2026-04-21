"""Rooms module - service layer."""
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas

def create_room_allocation(db: Session, allocation: schemas.RoomAllocationCreate) -> models.RoomAllocation:
    db_allocation = models.RoomAllocation(**allocation.model_dump())
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    return db_allocation
