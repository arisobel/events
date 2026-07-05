"""Finance module - service layer.

Consolida leitura financeira em cima de Hotel/Guests/Rooms:
grade de ocupação, resumo financeiro do evento e extrato por grupo.
"""
from datetime import date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from app.modules.events import models as event_models
from app.modules.guests import models as guest_models
from app.modules.hotel import models as hotel_models
from app.modules.rooms import models as room_models

from . import models, schemas


def _nights(start_date: date, end_date: date) -> int:
    """Noites entre as datas (checkout não conta); alocação de dia único conta 1."""
    return max((end_date - start_date).days, 1)


def _get_event(db: Session, event_id: int) -> Optional[event_models.Event]:
    return db.query(event_models.Event).filter(event_models.Event.id == event_id).first()


def _get_event_price_map(db: Session, event_id: int) -> dict:
    """Overrides de preço do evento: room_id -> preço/noite."""
    rows = (
        db.query(models.EventRoomPrice)
        .filter(models.EventRoomPrice.f_event_id == event_id)
        .all()
    )
    return {row.f_room_id: row.f_price_per_night for row in rows}


def _effective_price(price_map: dict, room: hotel_models.HotelRoom) -> Optional[Decimal]:
    override = price_map.get(room.id)
    if override is not None:
        return Decimal(override)
    if room.f_price_per_night is not None:
        return Decimal(room.f_price_per_night)
    return None


def get_event_room_prices(db: Session, event_id: int) -> Optional[List[models.EventRoomPrice]]:
    if not _get_event(db, event_id):
        return None
    return (
        db.query(models.EventRoomPrice)
        .filter(models.EventRoomPrice.f_event_id == event_id)
        .all()
    )


def upsert_event_room_price(
    db: Session,
    event_id: int,
    room_id: int,
    payload: schemas.EventRoomPriceUpsert,
) -> models.EventRoomPrice:
    event = _get_event(db, event_id)
    if not event:
        raise ValueError("Event not found")

    room = db.query(hotel_models.HotelRoom).filter(hotel_models.HotelRoom.id == room_id).first()
    if not room:
        raise ValueError("Room not found")
    if room.f_hotel_id != event.f_hotel_id:
        raise ValueError("Room does not belong to the event hotel")

    db_price = (
        db.query(models.EventRoomPrice)
        .filter(
            models.EventRoomPrice.f_event_id == event_id,
            models.EventRoomPrice.f_room_id == room_id,
        )
        .first()
    )
    if db_price:
        db_price.f_price_per_night = payload.f_price_per_night
    else:
        db_price = models.EventRoomPrice(
            f_event_id=event_id,
            f_room_id=room_id,
            f_price_per_night=payload.f_price_per_night,
        )
        db.add(db_price)

    db.commit()
    db.refresh(db_price)
    return db_price


def delete_event_room_price(db: Session, event_id: int, room_id: int) -> bool:
    db_price = (
        db.query(models.EventRoomPrice)
        .filter(
            models.EventRoomPrice.f_event_id == event_id,
            models.EventRoomPrice.f_room_id == room_id,
        )
        .first()
    )
    if not db_price:
        return False
    db.delete(db_price)
    db.commit()
    return True


def _get_event_allocations(db: Session, event_id: int) -> List[tuple]:
    """Alocações do evento com reserva e grupo, via join."""
    return (
        db.query(room_models.RoomAllocation, guest_models.Reservation, guest_models.GuestGroup)
        .join(
            guest_models.Reservation,
            room_models.RoomAllocation.f_reservation_id == guest_models.Reservation.id,
        )
        .join(
            guest_models.GuestGroup,
            guest_models.Reservation.f_group_id == guest_models.GuestGroup.id,
        )
        .filter(guest_models.Reservation.f_event_id == event_id)
        .all()
    )


def get_event_room_grid(db: Session, event_id: int) -> Optional[schemas.RoomGridResponse]:
    event = _get_event(db, event_id)
    if not event:
        return None

    rooms = (
        db.query(hotel_models.HotelRoom)
        .filter(hotel_models.HotelRoom.f_hotel_id == event.f_hotel_id)
        .order_by(hotel_models.HotelRoom.f_room_number)
        .all()
    )
    price_map = _get_event_price_map(db, event_id)

    allocations_by_room: dict[int, List[schemas.RoomGridAllocation]] = {}
    for allocation, reservation, group in _get_event_allocations(db, event_id):
        allocations_by_room.setdefault(allocation.f_room_id, []).append(
            schemas.RoomGridAllocation(
                allocation_id=allocation.id,
                reservation_id=reservation.id,
                group_id=group.id,
                group_name=group.f_name,
                f_start_date=allocation.f_start_date,
                f_end_date=allocation.f_end_date,
                f_payment_status=reservation.f_payment_status or "pending",
                f_checkin_status=allocation.f_checkin_status or "planned",
            )
        )

    grid_rooms = [
        schemas.RoomGridRoom(
            room_id=room.id,
            f_room_number=room.f_room_number,
            f_room_type=room.f_room_type,
            f_room_type_label=room.f_room_type_label,
            f_floor=room.f_floor,
            f_block=room.f_block,
            f_capacity=room.f_capacity,
            f_price_per_night=_effective_price(price_map, room),
            f_base_price_per_night=room.f_price_per_night,
            f_has_event_price=room.id in price_map,
            allocations=sorted(
                allocations_by_room.get(room.id, []),
                key=lambda a: a.f_start_date,
            ),
        )
        for room in rooms
    ]

    return schemas.RoomGridResponse(
        event_id=event.id,
        event_name=event.f_name,
        f_start_date=event.f_start_date,
        f_end_date=event.f_end_date,
        rooms=grid_rooms,
    )


def get_event_financial_summary(db: Session, event_id: int) -> Optional[schemas.FinancialSummaryResponse]:
    event = _get_event(db, event_id)
    if not event:
        return None

    total_rooms = (
        db.query(hotel_models.HotelRoom)
        .filter(hotel_models.HotelRoom.f_hotel_id == event.f_hotel_id)
        .count()
    )

    reservations = (
        db.query(guest_models.Reservation)
        .filter(guest_models.Reservation.f_event_id == event_id)
        .all()
    )

    # Potencial de receita por reserva: preço efetivo dos quartos alocados × noites.
    # Usado como fallback quando a reserva ainda não tem valor negociado (f_amount_total).
    price_map = _get_event_price_map(db, event_id)
    rooms_by_id = {
        room.id: room
        for room in db.query(hotel_models.HotelRoom)
        .filter(hotel_models.HotelRoom.f_hotel_id == event.f_hotel_id)
        .all()
    }
    potential_by_reservation: dict[int, Decimal] = {}
    allocated_room_nights = 0
    for allocation, reservation, _group in _get_event_allocations(db, event_id):
        nights = _nights(allocation.f_start_date, allocation.f_end_date)
        allocated_room_nights += nights
        room = rooms_by_id.get(allocation.f_room_id)
        if room is None:
            continue
        price = _effective_price(price_map, room)
        if price is not None:
            potential_by_reservation[reservation.id] = (
                potential_by_reservation.get(reservation.id, Decimal("0")) + price * nights
            )

    contracted_revenue = Decimal("0")  # só o que foi negociado (f_amount_total)
    expected_revenue = Decimal("0")    # contratado + potencial das reservas ainda sem valor fechado
    received_amount = Decimal("0")
    by_status = {"pending": 0, "partial": 0, "paid": 0}
    for reservation in reservations:
        if reservation.f_amount_total is not None:
            amount = Decimal(reservation.f_amount_total)
            contracted_revenue += amount
            expected_revenue += amount
        else:
            expected_revenue += potential_by_reservation.get(reservation.id, Decimal("0"))
        if reservation.f_amount_paid is not None:
            received_amount += Decimal(reservation.f_amount_paid)
        status = reservation.f_payment_status or "pending"
        by_status[status] = by_status.get(status, 0) + 1

    event_nights = _nights(event.f_start_date, event.f_end_date)
    capacity_nights = total_rooms * event_nights
    occupancy_rate = (
        round(allocated_room_nights / capacity_nights * 100, 1) if capacity_nights else 0.0
    )

    return schemas.FinancialSummaryResponse(
        event_id=event.id,
        total_rooms=total_rooms,
        event_nights=event_nights,
        allocated_room_nights=allocated_room_nights,
        occupancy_rate=occupancy_rate,
        reservation_count=len(reservations),
        contracted_revenue=contracted_revenue,
        expected_revenue=expected_revenue,
        received_amount=received_amount,
        pending_amount=expected_revenue - received_amount,
        reservations_by_payment_status=by_status,
    )


def get_group_invoice(db: Session, event_id: int, group_id: int) -> Optional[schemas.InvoiceResponse]:
    group = (
        db.query(guest_models.GuestGroup)
        .filter(
            guest_models.GuestGroup.id == group_id,
            guest_models.GuestGroup.f_event_id == event_id,
        )
        .first()
    )
    if not group:
        return None

    reservations = (
        db.query(guest_models.Reservation)
        .filter(
            guest_models.Reservation.f_event_id == event_id,
            guest_models.Reservation.f_group_id == group_id,
        )
        .all()
    )

    price_map = _get_event_price_map(db, event_id)
    invoice_reservations: List[schemas.InvoiceReservation] = []
    total_amount = Decimal("0")
    total_paid = Decimal("0")

    for reservation in reservations:
        allocations = (
            db.query(room_models.RoomAllocation, hotel_models.HotelRoom)
            .join(
                hotel_models.HotelRoom,
                room_models.RoomAllocation.f_room_id == hotel_models.HotelRoom.id,
            )
            .filter(room_models.RoomAllocation.f_reservation_id == reservation.id)
            .order_by(room_models.RoomAllocation.f_start_date)
            .all()
        )

        lines: List[schemas.InvoiceLine] = []
        calculated_total: Optional[Decimal] = None
        for allocation, room in allocations:
            nights = _nights(allocation.f_start_date, allocation.f_end_date)
            price_per_night = _effective_price(price_map, room)
            subtotal = price_per_night * nights if price_per_night is not None else None
            if subtotal is not None:
                calculated_total = (calculated_total or Decimal("0")) + subtotal
            lines.append(
                schemas.InvoiceLine(
                    allocation_id=allocation.id,
                    room_id=room.id,
                    f_room_number=room.f_room_number,
                    f_room_type_label=room.f_room_type_label,
                    f_start_date=allocation.f_start_date,
                    f_end_date=allocation.f_end_date,
                    nights=nights,
                    f_price_per_night=price_per_night,
                    subtotal=subtotal,
                )
            )

        amount_total = (
            Decimal(reservation.f_amount_total) if reservation.f_amount_total is not None else None
        )
        amount_paid = (
            Decimal(reservation.f_amount_paid) if reservation.f_amount_paid is not None else Decimal("0")
        )
        balance = amount_total - amount_paid if amount_total is not None else None

        if amount_total is not None:
            total_amount += amount_total
        total_paid += amount_paid

        invoice_reservations.append(
            schemas.InvoiceReservation(
                reservation_id=reservation.id,
                f_start_date=reservation.f_start_date,
                f_end_date=reservation.f_end_date,
                f_status=reservation.f_status or "confirmed",
                f_payment_status=reservation.f_payment_status or "pending",
                f_amount_total=amount_total,
                f_amount_paid=amount_paid,
                balance=balance,
                f_payment_notes=reservation.f_payment_notes,
                calculated_total=calculated_total,
                lines=lines,
            )
        )

    return schemas.InvoiceResponse(
        event_id=event_id,
        group_id=group.id,
        group_name=group.f_name,
        reservations=invoice_reservations,
        total_amount=total_amount,
        total_paid=total_paid,
        balance=total_amount - total_paid,
    )
