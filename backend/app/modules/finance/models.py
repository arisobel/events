"""Finance module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, Numeric, ForeignKey, UniqueConstraint

from app.db.base import Base


class EventRoomPrice(Base):
    """Preço do quarto para um evento específico — sobrepõe o preço base de HotelRoom."""
    __tablename__ = "t_event_room_price"
    __table_args__ = (
        UniqueConstraint("f_event_id", "f_room_id", name="uq_event_room_price"),
    )

    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False)
    f_room_id = Column(Integer, ForeignKey("t_hotel_room.id"), nullable=False)
    f_price_per_night = Column(Numeric(10, 2), nullable=False)
