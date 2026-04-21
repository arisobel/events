"""Guests module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, String, CHAR, DateTime, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class GuestGroup(Base):
    __tablename__ = "t_guest_group"
    
    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_name = Column(String(150), nullable=False)
    f_group_type = Column(String(50))
    f_phone = Column(String(50))
    f_email = Column(String(150))
    f_notes = Column(Text)
    
    guests = relationship("Guest", back_populates="group")
    reservations = relationship("Reservation", back_populates="group")


class Guest(Base):
    __tablename__ = "t_guest"
    
    id = Column(Integer, primary_key=True, index=True)
    f_group_id = Column(Integer, ForeignKey("t_guest_group.id"), nullable=False)
    f_full_name = Column(String(150), nullable=False)
    f_gender = Column(String(20))
    f_birth_date = Column(Date)
    f_document = Column(String(50))
    f_phone = Column(String(50))
    f_email = Column(String(150))
    f_guest_type = Column(String(50))
    f_notes = Column(Text)
    
    group = relationship("GuestGroup", back_populates="guests")


class Reservation(Base):
    __tablename__ = "t_reservation"
    
    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_group_id = Column(Integer, ForeignKey("t_guest_group.id"), nullable=False)
    f_start_date = Column(Date, nullable=False)
    f_end_date = Column(Date, nullable=False)
    f_package_type = Column(String(50))
    f_status = Column(String(30), default='confirmed')
    f_total_guests = Column(Integer)
    f_notes = Column(Text)
    
    group = relationship("GuestGroup", back_populates="reservations")


class SpecialRequest(Base):
    __tablename__ = "t_special_request"
    
    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_group_id = Column(Integer, ForeignKey("t_guest_group.id"))
    f_guest_id = Column(Integer, ForeignKey("t_guest.id"))
    f_request_type = Column(String(50))
    f_priority = Column(String(20), default='medium')
    f_status = Column(String(30), default='open')
    f_description = Column(Text, nullable=False)
    f_notes = Column(Text)
    f_created_at = Column(DateTime, default=datetime.utcnow)
