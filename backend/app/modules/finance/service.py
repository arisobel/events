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


# ---- Reservation extras ----

def _get_reservation(db: Session, reservation_id: int) -> Optional[guest_models.Reservation]:
    return (
        db.query(guest_models.Reservation)
        .filter(guest_models.Reservation.id == reservation_id)
        .first()
    )


def get_reservation_extras(db: Session, reservation_id: int) -> List[models.ReservationExtra]:
    return (
        db.query(models.ReservationExtra)
        .filter(models.ReservationExtra.f_reservation_id == reservation_id)
        .order_by(models.ReservationExtra.id)
        .all()
    )


def create_reservation_extra(
    db: Session,
    reservation_id: int,
    payload: schemas.ReservationExtraCreate,
) -> models.ReservationExtra:
    if not _get_reservation(db, reservation_id):
        raise ValueError("Reservation not found")

    db_extra = models.ReservationExtra(
        f_reservation_id=reservation_id,
        f_description=payload.f_description,
        f_amount=payload.f_amount,
        f_notes=payload.f_notes,
    )
    db.add(db_extra)
    db.commit()
    db.refresh(db_extra)
    return db_extra


def delete_reservation_extra(db: Session, reservation_id: int, extra_id: int) -> bool:
    db_extra = (
        db.query(models.ReservationExtra)
        .filter(
            models.ReservationExtra.id == extra_id,
            models.ReservationExtra.f_reservation_id == reservation_id,
        )
        .first()
    )
    if not db_extra:
        return False
    db.delete(db_extra)
    db.commit()
    return True


def _extras_total(db: Session, reservation_id: int) -> Decimal:
    total = Decimal("0")
    for extra in get_reservation_extras(db, reservation_id):
        total += Decimal(extra.f_amount)
    return total


# ---- Payments ----

def get_reservation_payments(db: Session, reservation_id: int) -> List[models.Payment]:
    return (
        db.query(models.Payment)
        .filter(models.Payment.f_reservation_id == reservation_id)
        .order_by(models.Payment.f_paid_at, models.Payment.id)
        .all()
    )


def _derive_payment_status(total_paid: Decimal, grand_total: Optional[Decimal]) -> str:
    """Status a partir do pago vs. total geral: pending / partial / paid."""
    if total_paid <= 0:
        return "pending"
    if grand_total is not None and grand_total > 0 and total_paid >= grand_total:
        return "paid"
    return "partial"


def _recompute_amount_paid(db: Session, reservation_id: int) -> None:
    """Mantém f_amount_paid = soma dos pagamentos e deriva f_payment_status.

    Assim a cor da grade reflete os pagamentos registrados sem ajuste manual.
    """
    reservation = _get_reservation(db, reservation_id)
    if not reservation:
        return
    total_paid = Decimal("0")
    for payment in get_reservation_payments(db, reservation_id):
        total_paid += Decimal(payment.f_amount)
    reservation.f_amount_paid = total_paid

    base = Decimal(reservation.f_amount_total) if reservation.f_amount_total is not None else Decimal("0")
    grand_total = base + _extras_total(db, reservation_id)
    reservation.f_payment_status = _derive_payment_status(total_paid, grand_total)


def create_payment(
    db: Session,
    reservation_id: int,
    payload: schemas.PaymentCreate,
) -> models.Payment:
    if not _get_reservation(db, reservation_id):
        raise ValueError("Reservation not found")

    db_payment = models.Payment(
        f_reservation_id=reservation_id,
        f_amount=payload.f_amount,
        f_paid_at=payload.f_paid_at or date.today(),
        f_method=payload.f_method,
        f_notes=payload.f_notes,
    )
    db.add(db_payment)
    db.flush()
    _recompute_amount_paid(db, reservation_id)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def delete_payment(db: Session, reservation_id: int, payment_id: int) -> bool:
    db_payment = (
        db.query(models.Payment)
        .filter(
            models.Payment.id == payment_id,
            models.Payment.f_reservation_id == reservation_id,
        )
        .first()
    )
    if not db_payment:
        return False
    db.delete(db_payment)
    db.flush()
    _recompute_amount_paid(db, reservation_id)
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
        # status derivado ao vivo (pago vs. total geral) para a cor refletir os pagamentos
        base = Decimal(reservation.f_amount_total) if reservation.f_amount_total is not None else Decimal("0")
        paid = Decimal(reservation.f_amount_paid) if reservation.f_amount_paid is not None else Decimal("0")
        grand_total = base + _extras_total(db, reservation.id)
        allocations_by_room.setdefault(allocation.f_room_id, []).append(
            schemas.RoomGridAllocation(
                allocation_id=allocation.id,
                reservation_id=reservation.id,
                group_id=group.id,
                group_name=group.f_name,
                group_nationality=group.f_nationality,
                f_start_date=allocation.f_start_date,
                f_end_date=allocation.f_end_date,
                f_payment_status=_derive_payment_status(paid, grand_total),
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

    contracted_revenue = Decimal("0")  # hospedagem negociada + extras (cobranças explícitas)
    expected_revenue = Decimal("0")    # (negociado ou potencial) + extras
    received_amount = Decimal("0")
    by_status = {"pending": 0, "partial": 0, "paid": 0}
    for reservation in reservations:
        extras_total = _extras_total(db, reservation.id)
        paid = Decimal(reservation.f_amount_paid) if reservation.f_amount_paid is not None else Decimal("0")
        if reservation.f_amount_total is not None:
            amount = Decimal(reservation.f_amount_total)
            contracted_revenue += amount + extras_total
            expected_revenue += amount + extras_total
            grand_total = amount + extras_total
        else:
            contracted_revenue += extras_total
            expected_revenue += potential_by_reservation.get(reservation.id, Decimal("0")) + extras_total
            grand_total = extras_total
        received_amount += paid
        # status derivado (consistente com grade e extrato)
        status = _derive_payment_status(paid, grand_total)
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

        extras = get_reservation_extras(db, reservation.id)
        extras_total = sum((Decimal(e.f_amount) for e in extras), Decimal("0"))
        payments = get_reservation_payments(db, reservation.id)

        # base de hospedagem: valor negociado se houver, senão o potencial calculado dos quartos
        lodging = amount_total if amount_total is not None else calculated_total
        grand_total = (
            (lodging or Decimal("0")) + extras_total
            if (lodging is not None or extras_total > 0)
            else None
        )
        balance = grand_total - amount_paid if grand_total is not None else None

        if grand_total is not None:
            total_amount += grand_total
        total_paid += amount_paid

        invoice_reservations.append(
            schemas.InvoiceReservation(
                reservation_id=reservation.id,
                f_start_date=reservation.f_start_date,
                f_end_date=reservation.f_end_date,
                f_status=reservation.f_status or "confirmed",
                f_payment_status=_derive_payment_status(amount_paid, grand_total),
                f_amount_total=amount_total,
                extras_total=extras_total,
                grand_total=grand_total,
                f_amount_paid=amount_paid,
                balance=balance,
                f_payment_notes=reservation.f_payment_notes,
                calculated_total=calculated_total,
                lines=lines,
                extras=[schemas.ReservationExtraResponse.model_validate(e) for e in extras],
                payments=[schemas.PaymentResponse.model_validate(p) for p in payments],
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
