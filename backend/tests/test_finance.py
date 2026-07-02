from decimal import Decimal

from sqlalchemy.orm import Session

from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.finance import service as finance_service
from app.modules.guests import schemas as guest_schemas
from app.modules.guests import service as guest_service
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service
from app.modules.rooms import schemas as room_schemas
from app.modules.rooms import service as room_service


def create_priced_setup(db_session: Session) -> tuple[int, int, int, int]:
    """Hotel com 2 quartos precificados + evento de 9 noites."""
    hotel = hotel_service.create_hotel(
        db_session,
        hotel_schemas.HotelCreate(f_name="Grand Palace", f_city="Miami"),
    )
    room_a = hotel_service.create_hotel_room(
        db_session,
        hotel_schemas.HotelRoomCreate(
            f_hotel_id=hotel.id,
            f_room_number="101",
            f_room_type="family",
            f_room_type_label="Família Vista Mar",
            f_capacity=4,
            f_price_per_night=Decimal("500.00"),
        ),
    )
    room_b = hotel_service.create_hotel_room(
        db_session,
        hotel_schemas.HotelRoomCreate(
            f_hotel_id=hotel.id,
            f_room_number="102",
            f_room_type="standard",
            f_capacity=2,
        ),
    )
    event = event_service.create_event(
        db_session,
        event_schemas.EventCreate(
            f_hotel_id=hotel.id,
            f_name="Pessach 2026",
            f_event_type="holiday",
            f_start_date="2026-04-01",
            f_end_date="2026-04-10",
        ),
    )
    return hotel.id, room_a.id, room_b.id, event.id


def create_group_with_paid_reservation(
    db_session: Session,
    event_id: int,
    room_id: int,
) -> tuple[int, int, int]:
    group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(f_event_id=event_id, f_name="Cohen Family"),
    )
    reservation = guest_service.create_reservation(
        db_session,
        event_id,
        group.id,
        guest_schemas.ReservationCreate(
            f_event_id=event_id,
            f_group_id=group.id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
            f_status="confirmed",
            f_total_guests=4,
            f_amount_total=Decimal("2000.00"),
            f_amount_paid=Decimal("500.00"),
            f_payment_status="partial",
        ),
    )
    allocation = room_service.create_room_allocation(
        db_session,
        room_schemas.RoomAllocationCreate(
            f_reservation_id=reservation.id,
            f_room_id=room_id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
        ),
    )
    return group.id, reservation.id, allocation.id


def test_room_grid_returns_rooms_with_allocations(db_session: Session) -> None:
    _, room_a_id, room_b_id, event_id = create_priced_setup(db_session)
    group_id, reservation_id, allocation_id = create_group_with_paid_reservation(
        db_session, event_id, room_a_id
    )

    grid = finance_service.get_event_room_grid(db_session, event_id)

    assert grid is not None
    assert grid.event_id == event_id
    assert len(grid.rooms) == 2

    room_a = next(room for room in grid.rooms if room.room_id == room_a_id)
    room_b = next(room for room in grid.rooms if room.room_id == room_b_id)

    assert room_a.f_price_per_night == Decimal("500.00")
    assert room_a.f_room_type_label == "Família Vista Mar"
    assert len(room_a.allocations) == 1
    assert room_a.allocations[0].allocation_id == allocation_id
    assert room_a.allocations[0].group_id == group_id
    assert room_a.allocations[0].group_name == "Cohen Family"
    assert room_a.allocations[0].f_payment_status == "partial"

    assert room_b.f_price_per_night is None
    assert room_b.allocations == []


def test_room_grid_returns_none_for_missing_event(db_session: Session) -> None:
    assert finance_service.get_event_room_grid(db_session, 999) is None


def test_financial_summary_totals_and_occupancy(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)
    create_group_with_paid_reservation(db_session, event_id, room_a_id)

    summary = finance_service.get_event_financial_summary(db_session, event_id)

    assert summary is not None
    assert summary.total_rooms == 2
    assert summary.event_nights == 9
    assert summary.allocated_room_nights == 4
    # 4 noites alocadas / (2 quartos * 9 noites) = 22.2%
    assert summary.occupancy_rate == 22.2
    assert summary.reservation_count == 1
    assert summary.expected_revenue == Decimal("2000.00")
    assert summary.received_amount == Decimal("500.00")
    assert summary.pending_amount == Decimal("1500.00")
    assert summary.reservations_by_payment_status == {"pending": 0, "partial": 1, "paid": 0}


def test_financial_summary_empty_event(db_session: Session) -> None:
    _, _, _, event_id = create_priced_setup(db_session)

    summary = finance_service.get_event_financial_summary(db_session, event_id)

    assert summary is not None
    assert summary.reservation_count == 0
    assert summary.expected_revenue == Decimal("0")
    assert summary.received_amount == Decimal("0")
    assert summary.pending_amount == Decimal("0")
    assert summary.occupancy_rate == 0.0


def test_group_invoice_lines_and_balance(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)
    group_id, reservation_id, allocation_id = create_group_with_paid_reservation(
        db_session, event_id, room_a_id
    )

    invoice = finance_service.get_group_invoice(db_session, event_id, group_id)

    assert invoice is not None
    assert invoice.group_id == group_id
    assert invoice.group_name == "Cohen Family"
    assert len(invoice.reservations) == 1

    reservation = invoice.reservations[0]
    assert reservation.reservation_id == reservation_id
    assert reservation.f_amount_total == Decimal("2000.00")
    assert reservation.f_amount_paid == Decimal("500.00")
    assert reservation.balance == Decimal("1500.00")
    assert reservation.calculated_total == Decimal("2000.00")  # 4 noites * 500.00

    assert len(reservation.lines) == 1
    line = reservation.lines[0]
    assert line.allocation_id == allocation_id
    assert line.f_room_number == "101"
    assert line.nights == 4
    assert line.subtotal == Decimal("2000.00")

    assert invoice.total_amount == Decimal("2000.00")
    assert invoice.total_paid == Decimal("500.00")
    assert invoice.balance == Decimal("1500.00")


def test_group_invoice_returns_none_for_wrong_event(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)
    group_id, _, _ = create_group_with_paid_reservation(db_session, event_id, room_a_id)

    assert finance_service.get_group_invoice(db_session, event_id + 1, group_id) is None


def test_reservation_payment_fields_update(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)
    _, reservation_id, _ = create_group_with_paid_reservation(db_session, event_id, room_a_id)

    updated = guest_service.update_reservation(
        db_session,
        reservation_id,
        guest_schemas.ReservationUpdate(
            f_amount_paid=Decimal("2000.00"),
            f_payment_status="paid",
            f_payment_notes="Quitado via PIX",
        ),
    )

    assert updated is not None
    assert updated.f_amount_paid == Decimal("2000.00")
    assert updated.f_payment_status == "paid"
    assert updated.f_payment_notes == "Quitado via PIX"
