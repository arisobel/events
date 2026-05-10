"""Rooms module - schemas, service, router."""
from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict

class RoomAllocationBase(BaseModel):
    f_room_id: int
    f_start_date: date
    f_end_date: date
    f_notes: Optional[str] = None

class RoomAllocationCreate(RoomAllocationBase):
    f_reservation_id: int

class RoomAllocationUpdate(BaseModel):
    f_room_id: Optional[int] = None
    f_start_date: Optional[date] = None
    f_end_date: Optional[date] = None
    f_checkin_status: Optional[str] = None
    f_checkout_status: Optional[str] = None
    f_notes: Optional[str] = None

class RoomAllocationResponse(RoomAllocationBase):
    id: int
    f_reservation_id: int
    f_checkin_status: str
    f_checkout_status: str
    model_config = ConfigDict(from_attributes=True)
