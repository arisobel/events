"""Guests module - schemas, service, router."""
from datetime import date
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator


GuestGender = Literal["male", "female"]
GuestType = Literal["adult", "child", "infant", "staff"]
PaymentStatus = Literal["pending", "partial", "paid"]


def _normalize_enum_value(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    return normalized or None


class ReservationBase(BaseModel):
    f_start_date: date
    f_end_date: date
    f_package_type: Optional[str] = None
    f_status: str = "confirmed"
    f_total_guests: Optional[int] = None
    f_amount_total: Optional[Decimal] = None
    f_amount_paid: Decimal = Decimal("0")
    f_payment_status: PaymentStatus = "pending"
    f_payment_notes: Optional[str] = None
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
    f_amount_total: Optional[Decimal] = None
    f_amount_paid: Optional[Decimal] = None
    f_payment_status: Optional[PaymentStatus] = None
    f_payment_notes: Optional[str] = None
    f_notes: Optional[str] = None


class ReservationResponse(ReservationBase):
    id: int
    f_event_id: int
    f_group_id: int

    model_config = ConfigDict(from_attributes=True)


class GuestInputBase(BaseModel):
    f_full_name: str
    f_gender: Optional[GuestGender] = None
    f_birth_date: Optional[date] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_guest_type: Optional[GuestType] = None
    f_is_group_leader: bool = False
    f_notes: Optional[str] = None

    @field_validator("f_gender", "f_guest_type", mode="before")
    @classmethod
    def normalize_enum_fields(cls, value: str | None) -> str | None:
        return _normalize_enum_value(value)


class GuestCreate(GuestInputBase):
    f_group_id: int


class GuestUpdate(BaseModel):
    f_full_name: Optional[str] = None
    f_gender: Optional[GuestGender] = None
    f_birth_date: Optional[date] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_guest_type: Optional[GuestType] = None
    f_is_group_leader: Optional[bool] = None
    f_notes: Optional[str] = None

    @field_validator("f_gender", "f_guest_type", mode="before")
    @classmethod
    def normalize_enum_fields(cls, value: str | None) -> str | None:
        return _normalize_enum_value(value)


class GuestResponse(BaseModel):
    id: int
    f_group_id: int
    f_person_id: Optional[int] = None
    f_full_name: str
    f_gender: Optional[str] = None
    f_birth_date: Optional[date] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_guest_type: Optional[str] = None
    f_is_group_leader: bool = False
    f_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


def _normalize_country_code(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().upper()
    return normalized or None


class GuestGroupBase(BaseModel):
    f_name: str
    f_group_type: Optional[str] = None
    f_nationality: Optional[str] = None  # ISO 3166-1 alpha-2 (BR, AR, US, IL...)
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_notes: Optional[str] = None

    @field_validator("f_nationality", mode="before")
    @classmethod
    def normalize_nationality(cls, value: str | None) -> str | None:
        return _normalize_country_code(value)


class GuestGroupCreate(GuestGroupBase):
    f_event_id: int


class GuestGroupUpdate(BaseModel):
    f_name: Optional[str] = None
    f_group_type: Optional[str] = None
    f_nationality: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_notes: Optional[str] = None

    @field_validator("f_nationality", mode="before")
    @classmethod
    def normalize_nationality(cls, value: str | None) -> str | None:
        return _normalize_country_code(value)


class GuestGroupResponse(GuestGroupBase):
    id: int
    f_event_id: int
    f_client_id: Optional[int] = None
    guests: List[GuestResponse] = []
    reservations: List[ReservationResponse] = []

    model_config = ConfigDict(from_attributes=True)
