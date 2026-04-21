"""Rooms module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, Date, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class RoomAllocation(Base):
    __tablename__ = "t_room_allocation"
    
    id = Column(Integer, primary_key=True, index=True)
    f_reservation_id = Column(Integer, ForeignKey("t_reservation.id"), nullable=False)
    f_room_id = Column(Integer, ForeignKey("t_hotel_room.id"), nullable=False)
    f_start_date = Column(Date, nullable=False)
    f_end_date = Column(Date, nullable=False)
    f_checkin_status = Column(String(30), default='planned')
    f_checkout_status = Column(String(30), default='planned')
    f_notes = Column(Text)
