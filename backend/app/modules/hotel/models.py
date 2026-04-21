"""Hotel module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, String, CHAR, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Hotel(Base):
    """Hotel model - represents the physical hotel infrastructure."""
    __tablename__ = "t_hotel"
    
    id = Column(Integer, primary_key=True, index=True)
    f_name = Column(String(150), nullable=False)
    f_trade_name = Column(String(150))
    f_document = Column(String(30))
    f_phone = Column(String(50))
    f_email = Column(String(150))
    f_address = Column(Text)
    f_city = Column(String(100))
    f_state = Column(String(100))
    f_country = Column(String(100))
    f_notes = Column(Text)
    f_is_active = Column(CHAR(1), default='T')
    f_created_at = Column(DateTime, default=datetime.utcnow)
    f_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    spaces = relationship("HotelSpace", back_populates="hotel")
    rooms = relationship("HotelRoom", back_populates="hotel")
    kitchens = relationship("HotelKitchen", back_populates="hotel")
    tables = relationship("HotelTable", back_populates="hotel")


class HotelSpace(Base):
    """HotelSpace model - represents spaces within a hotel (halls, pools, etc.)."""
    __tablename__ = "t_hotel_space"
    
    id = Column(Integer, primary_key=True, index=True)
    f_hotel_id = Column(Integer, ForeignKey("t_hotel.id"), nullable=False)
    f_name = Column(String(150), nullable=False)
    f_space_type = Column(String(50), nullable=False)  # hall, pool, gym, beach, etc.
    f_capacity = Column(Integer)
    f_floor = Column(String(50))
    f_block = Column(String(50))
    f_is_active = Column(CHAR(1), default='T')
    f_notes = Column(Text)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="spaces")


class HotelRoom(Base):
    """HotelRoom model - represents hotel rooms."""
    __tablename__ = "t_hotel_room"
    
    id = Column(Integer, primary_key=True, index=True)
    f_hotel_id = Column(Integer, ForeignKey("t_hotel.id"), nullable=False)
    f_room_number = Column(String(20), nullable=False)
    f_room_type = Column(String(50))  # standard, suite, family, etc.
    f_floor = Column(String(50))
    f_block = Column(String(50))
    f_capacity = Column(Integer, nullable=False, default=1)
    f_status = Column(String(30), default='available')  # available, occupied, cleaning, maintenance
    f_notes = Column(Text)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="rooms")


class HotelKitchen(Base):
    """HotelKitchen model - represents kitchens within a hotel."""
    __tablename__ = "t_hotel_kitchen"
    
    id = Column(Integer, primary_key=True, index=True)
    f_hotel_id = Column(Integer, ForeignKey("t_hotel.id"), nullable=False)
    f_space_id = Column(Integer, ForeignKey("t_hotel_space.id"))
    f_name = Column(String(150), nullable=False)
    f_kitchen_type = Column(String(50))  # meat, dairy, parve, etc.
    f_capacity_level = Column(String(50))
    f_notes = Column(Text)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="kitchens")


class HotelTable(Base):
    """HotelTable model - represents physical dining tables."""
    __tablename__ = "t_hotel_table"
    
    id = Column(Integer, primary_key=True, index=True)
    f_hotel_id = Column(Integer, ForeignKey("t_hotel.id"), nullable=False)
    f_space_id = Column(Integer, ForeignKey("t_hotel_space.id"))
    f_table_code = Column(String(30), nullable=False)
    f_capacity = Column(Integer, nullable=False)
    f_shape = Column(String(30))  # round, rectangular, etc.
    f_notes = Column(Text)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="tables")
