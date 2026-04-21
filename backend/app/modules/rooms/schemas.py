"""Rooms module - schemas, service, router."""
from pydantic import BaseModel, ConfigDict
from datetime import date

class RoomAllocationBase(BaseModel):
    f_room_id: int
    f_start_date: date
    f_end_date: date

class RoomAllocationCreate(RoomAllocationBase):
    f_reservation_id: int

class RoomAllocationResponse(RoomAllocationBase):
    id: int
    f_reservation_id: int
    f_checkin_status: str
    f_checkout_status: str
    model_config = ConfigDict(from_attributes=True)
