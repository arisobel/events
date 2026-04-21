"""Guests module - schemas, service, router."""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class GuestGroupBase(BaseModel):
    f_name: str
    f_group_type: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None

class GuestGroupCreate(GuestGroupBase):
    f_event_id: int

class GuestGroupResponse(GuestGroupBase):
    id: int
    f_event_id: int
    model_config = ConfigDict(from_attributes=True)
