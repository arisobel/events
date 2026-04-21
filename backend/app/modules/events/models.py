"""Events module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, String, CHAR, DateTime, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Event(Base):
    """Event model - time-bound operational instance linked to a hotel."""
    __tablename__ = "t_event"
    
    id = Column(Integer, primary_key=True, index=True)
    f_hotel_id = Column(Integer, ForeignKey("t_hotel.id"), nullable=False)
    f_name = Column(String(150), nullable=False)
    f_event_type = Column(String(50))
    f_start_date = Column(Date, nullable=False)
    f_end_date = Column(Date, nullable=False)
    f_expected_guests = Column(Integer)
    f_expected_families = Column(Integer)
    f_status = Column(String(30), default='draft')
    f_notes = Column(Text)
    f_created_at = Column(DateTime, default=datetime.utcnow)
    f_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    periods = relationship("EventPeriod", back_populates="event")
    spaces = relationship("EventSpace", back_populates="event")
    configurations = relationship("EventConfiguration", back_populates="event")


class EventPeriod(Base):
    """EventPeriod model - time periods within an event (e.g., Yom Tov, Chol Hamoed)."""
    __tablename__ = "t_event_period"
    
    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_name = Column(String(100), nullable=False)
    f_period_type = Column(String(50))
    f_start_date = Column(Date, nullable=False)
    f_end_date = Column(Date, nullable=False)
    f_sort_order = Column(Integer, default=0)
    f_notes = Column(Text)
    
    # Relationships
    event = relationship("Event", back_populates="periods")


class EventSpace(Base):
    """EventSpace model - links hotel spaces to events with specific usage."""
    __tablename__ = "t_event_space"
    
    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_space_id = Column(Integer, ForeignKey("t_hotel_space.id"), nullable=False)
    f_usage_type = Column(String(50))
    f_is_active = Column(CHAR(1), default='T')
    f_notes = Column(Text)
    
    # Relationships
    event = relationship("Event", back_populates="spaces")


class EventConfiguration(Base):
    """EventConfiguration model - key-value configuration for events."""
    __tablename__ = "t_event_configuration"
    
    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_config_key = Column(String(100), nullable=False)
    f_config_value = Column(Text)
    
    # Relationships
    event = relationship("Event", back_populates="configurations")
