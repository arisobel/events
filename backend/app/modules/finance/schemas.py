"""Finance module - Pydantic schemas."""
from datetime import date
from decimal import Decimal
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# Event room price schemas
class EventRoomPriceUpsert(BaseModel):
    f_price_per_night: Decimal


class EventRoomPriceResponse(BaseModel):
    id: int
    f_event_id: int
    f_room_id: int
    f_price_per_night: Decimal

    model_config = ConfigDict(from_attributes=True)


# Room grid schemas
class RoomGridAllocation(BaseModel):
    allocation_id: int
    reservation_id: int
    group_id: int
    group_name: str
    f_start_date: date
    f_end_date: date
    f_payment_status: str
    f_checkin_status: str


class RoomGridRoom(BaseModel):
    room_id: int
    f_room_number: str
    f_room_type: Optional[str] = None
    f_room_type_label: Optional[str] = None
    f_floor: Optional[str] = None
    f_block: Optional[str] = None
    f_capacity: int
    f_price_per_night: Optional[Decimal] = None  # preço efetivo: evento > base do quarto
    f_base_price_per_night: Optional[Decimal] = None
    f_has_event_price: bool = False
    allocations: List[RoomGridAllocation] = []


class RoomGridResponse(BaseModel):
    event_id: int
    event_name: str
    f_start_date: date
    f_end_date: date
    rooms: List[RoomGridRoom] = []


# Financial summary schemas
class FinancialSummaryResponse(BaseModel):
    event_id: int
    total_rooms: int
    event_nights: int
    allocated_room_nights: int
    occupancy_rate: float
    reservation_count: int
    expected_revenue: Decimal
    received_amount: Decimal
    pending_amount: Decimal
    reservations_by_payment_status: Dict[str, int]


# Invoice schemas
class InvoiceLine(BaseModel):
    allocation_id: int
    room_id: int
    f_room_number: str
    f_room_type_label: Optional[str] = None
    f_start_date: date
    f_end_date: date
    nights: int
    f_price_per_night: Optional[Decimal] = None
    subtotal: Optional[Decimal] = None


class InvoiceReservation(BaseModel):
    reservation_id: int
    f_start_date: date
    f_end_date: date
    f_status: str
    f_payment_status: str
    f_amount_total: Optional[Decimal] = None
    f_amount_paid: Decimal
    balance: Optional[Decimal] = None
    f_payment_notes: Optional[str] = None
    calculated_total: Optional[Decimal] = None
    lines: List[InvoiceLine] = []


class InvoiceResponse(BaseModel):
    event_id: int
    group_id: int
    group_name: str
    reservations: List[InvoiceReservation] = []
    total_amount: Decimal
    total_paid: Decimal
    balance: Decimal
