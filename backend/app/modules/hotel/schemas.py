"""Hotel module - Pydantic schemas."""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


# Hotel schemas
class HotelBase(BaseModel):
    f_name: str
    f_trade_name: Optional[str] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_address: Optional[str] = None
    f_city: Optional[str] = None
    f_state: Optional[str] = None
    f_country: Optional[str] = None
    f_notes: Optional[str] = None


class HotelCreate(HotelBase):
    pass


class HotelUpdate(BaseModel):
    f_name: Optional[str] = None
    f_trade_name: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_is_active: Optional[str] = None


class HotelResponse(HotelBase):
    id: int
    f_is_active: str
    f_created_at: datetime
    f_updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# HotelSpace schemas
class HotelSpaceBase(BaseModel):
    f_name: str
    f_space_type: str
    f_capacity: Optional[int] = None
    f_floor: Optional[str] = None
    f_block: Optional[str] = None
    f_notes: Optional[str] = None


class HotelSpaceCreate(HotelSpaceBase):
    f_hotel_id: int


class HotelSpaceResponse(HotelSpaceBase):
    id: int
    f_hotel_id: int
    f_is_active: str
    
    model_config = ConfigDict(from_attributes=True)


# HotelRoom schemas
class HotelRoomBase(BaseModel):
    f_room_number: str
    f_room_type: Optional[str] = None
    f_floor: Optional[str] = None
    f_block: Optional[str] = None
    f_capacity: int = 1
    f_notes: Optional[str] = None


class HotelRoomCreate(HotelRoomBase):
    f_hotel_id: int


class HotelRoomUpdate(BaseModel):
    f_status: Optional[str] = None
    f_notes: Optional[str] = None


class HotelRoomResponse(HotelRoomBase):
    id: int
    f_hotel_id: int
    f_status: str
    
    model_config = ConfigDict(from_attributes=True)


# HotelKitchen schemas
class HotelKitchenBase(BaseModel):
    f_name: str
    f_kitchen_type: Optional[str] = None
    f_capacity_level: Optional[str] = None
    f_notes: Optional[str] = None


class HotelKitchenCreate(HotelKitchenBase):
    f_hotel_id: int
    f_space_id: Optional[int] = None


class HotelKitchenResponse(HotelKitchenBase):
    id: int
    f_hotel_id: int
    f_space_id: Optional[int]
    
    model_config = ConfigDict(from_attributes=True)


# HotelTable schemas
class HotelTableBase(BaseModel):
    f_table_code: str
    f_capacity: int
    f_shape: Optional[str] = None
    f_notes: Optional[str] = None


class HotelTableCreate(HotelTableBase):
    f_hotel_id: int
    f_space_id: Optional[int] = None


class HotelTableResponse(HotelTableBase):
    id: int
    f_hotel_id: int
    f_space_id: Optional[int]
    
    model_config = ConfigDict(from_attributes=True)
