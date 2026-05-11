"""Guests module - schemas, service, router."""
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ReservationBase(BaseModel):
    f_start_date: date
    f_end_date: date
    f_package_type: Optional[str] = None
    f_status: str = "confirmed"
    f_total_guests: Optional[int] = None
    f_notes: Optional[str] = None


class ReservationCreate(ReservationBase):
    f_event_id: int
    f_group_id: int


class ReservationUpdate(BaseModel):
    f_start_date: Optional[date] = None
    f_end_date: Optional[date] = None
    f_package_type: Optional[str] = None
    f_status: Optional[str] = None
    f_total_guests: Optional[int] = None
    f_notes: Optional[str] = None


class ReservationResponse(ReservationBase):
    id: int
    f_event_id: int
    f_group_id: int

    model_config = ConfigDict(from_attributes=True)


class GuestBase(BaseModel):
    f_full_name: str
    f_gender: Optional[str] = None
    f_birth_date: Optional[date] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_guest_type: Optional[str] = None
    f_is_group_leader: bool = False
    f_notes: Optional[str] = None


class GuestCreate(GuestBase):
    f_group_id: int


class GuestUpdate(BaseModel):
    f_full_name: Optional[str] = None
    f_gender: Optional[str] = None
    f_birth_date: Optional[date] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_guest_type: Optional[str] = None
    f_is_group_leader: Optional[bool] = None
    f_notes: Optional[str] = None


class GuestResponse(GuestBase):
    id: int
    f_group_id: int

    model_config = ConfigDict(from_attributes=True)


class GuestGroupBase(BaseModel):
    f_name: str
    f_group_type: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_notes: Optional[str] = None


class GuestGroupCreate(GuestGroupBase):
    f_event_id: int


class GuestGroupUpdate(BaseModel):
    f_name: Optional[str] = None
    f_group_type: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_notes: Optional[str] = None


class GuestGroupResponse(GuestGroupBase):
    id: int
    f_event_id: int
    guests: List[GuestResponse] = []
    reservations: List[ReservationResponse] = []

    model_config = ConfigDict(from_attributes=True)
