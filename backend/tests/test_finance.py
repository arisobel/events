from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from app.modules.finance import schemas as finance_schemas
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


def test_reservation_extras_crud_and_grand_total(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)
    group_id, reservation_id, _ = create_group_with_paid_reservation(db_session, event_id, room_a_id)

    # duas cobranças extras
    extra1 = finance_service.create_reservation_extra(
        db_session,
        reservation_id,
        finance_schemas.ReservationExtraCreate(f_description="Sala especial de refeição", f_amount=Decimal("800.00")),
    )
    finance_service.create_reservation_extra(
        db_session,
        reservation_id,
        finance_schemas.ReservationExtraCreate(f_description="Babá", f_amount=Decimal("300.00")),
    )

    extras = finance_service.get_reservation_extras(db_session, reservation_id)
    assert len(extras) == 2

    invoice = finance_service.get_group_invoice(db_session, event_id, group_id)
    assert invoice is not None
    res = invoice.reservations[0]
    assert res.f_amount_total == Decimal("2000.00")
    assert res.extras_total == Decimal("1100.00")
    assert res.grand_total == Decimal("3100.00")  # 2000 hospedagem + 1100 extras
    assert res.balance == Decimal("2600.00")       # 3100 - 500 pago
    assert len(res.extras) == 2
    assert invoice.total_amount == Decimal("3100.00")

    # remover um extra recalcula o total
    assert finance_service.delete_reservation_extra(db_session, reservation_id, extra1.id) is True
    invoice = finance_service.get_group_invoice(db_session, event_id, group_id)
    assert invoice is not None
    assert invoice.reservations[0].extras_total == Decimal("300.00")
    assert invoice.reservations[0].grand_total == Decimal("2300.00")


def test_extras_count_in_financial_summary(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)
    _, reservation_id, _ = create_group_with_paid_reservation(db_session, event_id, room_a_id)

    finance_service.create_reservation_extra(
        db_session,
        reservation_id,
        finance_schemas.ReservationExtraCreate(f_description="Sala especial", f_amount=Decimal("800.00")),
    )

    summary = finance_service.get_event_financial_summary(db_session, event_id)
    assert summary is not None
    # 2000 hospedagem negociada + 800 extra
    assert summary.contracted_revenue == Decimal("2800.00")
    assert summary.expected_revenue == Decimal("2800.00")


def test_multiple_payments_sum_into_amount_paid(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)
    group_id, reservation_id, _ = create_group_with_paid_reservation(db_session, event_id, room_a_id)

    # a reserva foi criada com f_amount_paid=500 manual; ao registrar pagamentos, vira a soma deles
    p1 = finance_service.create_payment(
        db_session,
        reservation_id,
        finance_schemas.PaymentCreate(f_amount=Decimal("700.00"), f_method="PIX"),
    )
    finance_service.create_payment(
        db_session,
        reservation_id,
        finance_schemas.PaymentCreate(f_amount=Decimal("300.00"), f_method="dinheiro"),
    )

    payments = finance_service.get_reservation_payments(db_session, reservation_id)
    assert len(payments) == 2

    reservation = guest_service.get_reservation(db_session, reservation_id)
    assert reservation is not None
    assert Decimal(reservation.f_amount_paid) == Decimal("1000.00")  # 700 + 300

    invoice = finance_service.get_group_invoice(db_session, event_id, group_id)
    assert invoice is not None
    assert invoice.reservations[0].f_amount_paid == Decimal("1000.00")
    assert len(invoice.reservations[0].payments) == 2
    assert invoice.reservations[0].balance == Decimal("1000.00")  # 2000 - 1000

    # remover um pagamento recalcula o total pago
    assert finance_service.delete_payment(db_session, reservation_id, p1.id) is True
    reservation = guest_service.get_reservation(db_session, reservation_id)
    assert reservation is not None
    assert Decimal(reservation.f_amount_paid) == Decimal("300.00")


def test_extra_and_payment_reject_missing_reservation(db_session: Session) -> None:
    with pytest.raises(ValueError):
        finance_service.create_reservation_extra(
            db_session, 999, finance_schemas.ReservationExtraCreate(f_description="X", f_amount=Decimal("10"))
        )
    with pytest.raises(ValueError):
        finance_service.create_payment(
            db_session, 999, finance_schemas.PaymentCreate(f_amount=Decimal("10"))
        )


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


def test_group_nationality_normalized_and_exposed_in_room_grid(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)

    # código informado em minúsculo deve ser normalizado para alpha-2 maiúsculo
    group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(
            f_event_id=event_id, f_name="Cohen Family", f_nationality="br"
        ),
    )
    assert group.f_nationality == "BR"

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
        ),
    )
    room_service.create_room_allocation(
        db_session,
        room_schemas.RoomAllocationCreate(
            f_reservation_id=reservation.id,
            f_room_id=room_a_id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
        ),
    )

    grid = finance_service.get_event_room_grid(db_session, event_id)
    assert grid is not None
    room_a = next(room for room in grid.rooms if room.room_id == room_a_id)
    assert room_a.allocations[0].group_nationality == "BR"


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
    # reserva tem f_amount_total=2000 → contratado e esperado batem
    assert summary.contracted_revenue == Decimal("2000.00")
    assert summary.expected_revenue == Decimal("2000.00")
    assert summary.received_amount == Decimal("500.00")
    assert summary.pending_amount == Decimal("1500.00")
    assert summary.reservations_by_payment_status == {"pending": 0, "partial": 1, "paid": 0}


def test_financial_summary_uses_room_price_potential_when_no_amount_total(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)

    # reserva SEM valor negociado, mas com alocação em quarto precificado (500/noite × 4 noites)
    group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(f_event_id=event_id, f_name="Levi Family"),
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
        ),
    )
    room_service.create_room_allocation(
        db_session,
        room_schemas.RoomAllocationCreate(
            f_reservation_id=reservation.id,
            f_room_id=room_a_id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
        ),
    )

    summary = finance_service.get_event_financial_summary(db_session, event_id)

    assert summary is not None
    # nada contratado ainda, mas o potencial dos quartos alocados aparece na receita esperada
    assert summary.contracted_revenue == Decimal("0")
    assert summary.expected_revenue == Decimal("2000.00")  # 4 noites × 500
    assert summary.pending_amount == Decimal("2000.00")


def test_financial_summary_event_price_override_changes_potential(db_session: Session) -> None:
    _, room_a_id, _, event_id = create_priced_setup(db_session)

    group = guest_service.create_guest_group(
        db_session,
        guest_schemas.GuestGroupCreate(f_event_id=event_id, f_name="Levi Family"),
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
        ),
    )
    room_service.create_room_allocation(
        db_session,
        room_schemas.RoomAllocationCreate(
            f_reservation_id=reservation.id,
            f_room_id=room_a_id,
            f_start_date="2026-04-01",
            f_end_date="2026-04-05",
        ),
    )
    finance_service.upsert_event_room_price(
        db_session,
        event_id,
        room_a_id,
        finance_schemas.EventRoomPriceUpsert(f_price_per_night=Decimal("800.00")),
    )

    summary = finance_service.get_event_financial_summary(db_session, event_id)
    assert summary is not None
    # potencial usa o preço do evento (800) e não o base (500): 4 × 800
    assert summary.expected_revenue == Decimal("3200.00")


def test_financial_summary_empty_event(db_session: Session) -> None:
    _, _, _, event_id = create_priced_setup(db_session)

    summary = finance_service.get_event_financial_summary(db_session, event_id)

    assert summary is not None
    assert summary.reservation_count == 0
    assert summary.contracted_revenue == Decimal("0")
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


def test_event_room_price_overrides_base_price(db_session: Session) -> None:
    _, room_a_id, room_b_id, event_id = create_priced_setup(db_session)
    group_id, _, _ = create_group_with_paid_reservation(db_session, event_id, room_a_id)

    finance_service.upsert_event_room_price(
        db_session,
        event_id,
        room_a_id,
        finance_schemas.EventRoomPriceUpsert(f_price_per_night=Decimal("800.00")),
    )

    grid = finance_service.get_event_room_grid(db_session, event_id)
    assert grid is not None
    room_a = next(room for room in grid.rooms if room.room_id == room_a_id)
    room_b = next(room for room in grid.rooms if room.room_id == room_b_id)

    # room A: override do evento vence o preço base
    assert room_a.f_price_per_night == Decimal("800.00")
    assert room_a.f_base_price_per_night == Decimal("500.00")
    assert room_a.f_has_event_price is True
    # room B: sem override e sem base
    assert room_b.f_price_per_night is None
    assert room_b.f_has_event_price is False

    # extrato usa o preço efetivo: 4 noites * 800
    invoice = finance_service.get_group_invoice(db_session, event_id, group_id)
    assert invoice is not None
    assert invoice.reservations[0].calculated_total == Decimal("3200.00")

    # upsert atualiza em vez de duplicar
    finance_service.upsert_event_room_price(
        db_session,
        event_id,
        room_a_id,
        finance_schemas.EventRoomPriceUpsert(f_price_per_night=Decimal("900.00")),
    )
    prices = finance_service.get_event_room_prices(db_session, event_id)
    assert prices is not None
    assert len(prices) == 1
    assert prices[0].f_price_per_night == Decimal("900.00")

    # delete volta ao preço base
    assert finance_service.delete_event_room_price(db_session, event_id, room_a_id) is True
    grid = finance_service.get_event_room_grid(db_session, event_id)
    assert grid is not None
    room_a = next(room for room in grid.rooms if room.room_id == room_a_id)
    assert room_a.f_price_per_night == Decimal("500.00")
    assert room_a.f_has_event_price is False


def test_event_room_price_rejects_room_from_other_hotel(db_session: Session) -> None:
    _, _, _, event_id = create_priced_setup(db_session)
    other_hotel = hotel_service.create_hotel(
        db_session, hotel_schemas.HotelCreate(f_name="Other Hotel")
    )
    other_room = hotel_service.create_hotel_room(
        db_session,
        hotel_schemas.HotelRoomCreate(f_hotel_id=other_hotel.id, f_room_number="901"),
    )

    with pytest.raises(ValueError):
        finance_service.upsert_event_room_price(
            db_session,
            event_id,
            other_room.id,
            finance_schemas.EventRoomPriceUpsert(f_price_per_night=Decimal("100.00")),
        )


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
