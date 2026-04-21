"""Events module - Pydantic schemas."""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date


class EventBase(BaseModel):
    f_name: str
    f_event_type: Optional[str] = None
    f_start_date: date
    f_end_date: date
    f_expected_guests: Optional[int] = None
    f_expected_families: Optional[int] = None
    f_notes: Optional[str] = None


class EventCreate(EventBase):
    f_hotel_id: int


class EventUpdate(BaseModel):
    f_name: Optional[str] = None
    f_status: Optional[str] = None
    f_expected_guests: Optional[int] = None
    f_notes: Optional[str] = None


class EventResponse(EventBase):
    id: int
    f_hotel_id: int
    f_status: str
    f_created_at: datetime
    f_updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class EventPeriodBase(BaseModel):
    f_name: str
    f_period_type: Optional[str] = None
    f_start_date: date
    f_end_date: date
    f_sort_order: int = 0
    f_notes: Optional[str] = None


class EventPeriodCreate(EventPeriodBase):
    f_event_id: int


class EventPeriodResponse(EventPeriodBase):
    id: int
    f_event_id: int
    
    model_config = ConfigDict(from_attributes=True)
