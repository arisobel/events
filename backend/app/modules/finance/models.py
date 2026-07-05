"""Finance module - SQLAlchemy models."""
from datetime import date

from sqlalchemy import Column, Date, Integer, Numeric, String, Text, ForeignKey, UniqueConstraint

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


class ReservationExtra(Base):
    """Item adicional cobrado numa reserva (sala especial, sub-evento, serviço).

    Soma-se por cima da hospedagem (f_amount_total) para formar o total a cobrar.
    """
    __tablename__ = "t_reservation_extra"

    id = Column(Integer, primary_key=True, index=True)
    f_reservation_id = Column(Integer, ForeignKey("t_reservation.id"), nullable=False)
    f_description = Column(String(150), nullable=False)
    f_amount = Column(Numeric(10, 2), nullable=False)
    f_notes = Column(Text)


class Payment(Base):
    """Pagamento (parcela) de uma reserva. A soma alimenta Reservation.f_amount_paid."""
    __tablename__ = "t_payment"

    id = Column(Integer, primary_key=True, index=True)
    f_reservation_id = Column(Integer, ForeignKey("t_reservation.id"), nullable=False)
    f_amount = Column(Numeric(10, 2), nullable=False)
    f_paid_at = Column(Date, nullable=False, default=date.today)
    f_method = Column(String(50))  # PIX, dinheiro, cartão, transferência, etc.
    f_notes = Column(Text)
