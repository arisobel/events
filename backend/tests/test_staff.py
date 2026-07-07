"""Fatia 3 do bloco Facilities+Staff (2026-07-07): Employee raiz + engajamento por evento."""
from datetime import date
from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from app.modules.clients import schemas as client_schemas
from app.modules.clients import service as client_service
from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.guests.models import Guest, GuestGroup
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service
from app.modules.staff import schemas as staff_schemas
from app.modules.staff import service as staff_service


def _create_event(db_session: Session) -> int:
    hotel = hotel_service.create_hotel(
        db_session, hotel_schemas.HotelCreate(f_name="Grand Palace", f_city="Miami")
    )
    event = event_service.create_event(
        db_session,
        event_schemas.EventCreate(
            f_hotel_id=hotel.id,
            f_name="Pessach 2027",
            f_event_type="holiday",
            f_start_date="2027-04-01",
            f_end_date="2027-04-10",
        ),
    )
    return event.id


def _create_employee(db_session: Session, **overrides) -> staff_service.models.Employee:
    data = dict(f_full_name="Moshe Cohen", f_default_role="mashguiach")
    data.update(overrides)
    return staff_service.create_employee(db_session, staff_schemas.EmployeeCreate(**data))


def test_employee_crud_and_search(db_session: Session) -> None:
    employee = _create_employee(db_session, f_phone="+55 11 99999-0000")
    assert employee.id is not None
    assert employee.f_is_active == 'T'

    _create_employee(db_session, f_full_name="David Levi", f_default_role="monitor")

    all_employees = staff_service.list_employees(db_session)
    assert len(all_employees) == 2

    found = staff_service.list_employees(db_session, search="moshe")
    assert len(found) == 1 and found[0].f_full_name == "Moshe Cohen"

    updated = staff_service.update_employee(
        db_session,
        employee.id,
        staff_schemas.EmployeeUpdate(f_default_role="rabino", f_email="moshe@ex.com"),
    )
    assert updated is not None
    assert updated.f_default_role == "rabino"
    assert updated.f_phone == "+55 11 99999-0000"  # inalterado

    assert staff_service.delete_employee(db_session, employee.id) is True
    assert staff_service.get_employee(db_session, employee.id) is None


def test_employee_missing_person_rejected(db_session: Session) -> None:
    with pytest.raises(ValueError, match="Person not found"):
        _create_employee(db_session, f_person_id=999)


def test_assignment_costs_derivation(db_session: Session) -> None:
    event_id = _create_event(db_session)
    employee = _create_employee(db_session, f_default_daily_cost=Decimal("200.00"))

    # 1) sem override: diária padrão × dias (inclusivo: 5 dias)
    a1 = staff_service.create_assignment(
        db_session,
        event_id,
        staff_schemas.AssignmentCreate(
            f_employee_id=employee.id,
            f_role="mashguiach",
            f_start_date=date(2027, 3, 27),  # D-5: kasherização antes do evento
            f_end_date=date(2027, 3, 31),
        ),
    )
    assert a1.work_days == 5
    assert a1.effective_daily_cost == Decimal("200.00")
    assert a1.derived_total_cost == Decimal("1000.00")
    assert a1.employee_name == "Moshe Cohen"

    # 2) override de diária no engajamento
    a2 = staff_service.create_assignment(
        db_session,
        event_id,
        staff_schemas.AssignmentCreate(
            f_employee_id=employee.id,
            f_start_date=date(2027, 4, 1),
            f_end_date=date(2027, 4, 10),
            f_daily_cost=Decimal("250.00"),
        ),
    )
    assert a2.effective_daily_cost == Decimal("250.00")
    assert a2.derived_total_cost == Decimal("2500.00")

    # 3) total fechado é autoritativo sobre o cálculo
    a3 = staff_service.create_assignment(
        db_session,
        event_id,
        staff_schemas.AssignmentCreate(
            f_employee_id=employee.id,
            f_start_date=date(2027, 4, 1),
            f_end_date=date(2027, 4, 10),
            f_daily_cost=Decimal("250.00"),
            f_total_cost=Decimal("2000.00"),
        ),
    )
    assert a3.derived_total_cost == Decimal("2000.00")

    assert len(staff_service.get_event_assignments(db_session, event_id)) == 3
    assert len(staff_service.get_employee_assignments(db_session, employee.id)) == 3


def test_assignment_invalid_dates_rejected(db_session: Session) -> None:
    with pytest.raises(Exception):  # pydantic ValidationError no schema
        staff_schemas.AssignmentCreate(
            f_employee_id=1,
            f_start_date=date(2027, 4, 10),
            f_end_date=date(2027, 4, 1),
        )


def test_delete_employee_with_assignments_blocked(db_session: Session) -> None:
    event_id = _create_event(db_session)
    employee = _create_employee(db_session)
    staff_service.create_assignment(
        db_session,
        event_id,
        staff_schemas.AssignmentCreate(f_employee_id=employee.id, f_role="monitor"),
    )

    with pytest.raises(ValueError, match="assignments"):
        staff_service.delete_employee(db_session, employee.id)


def test_lodge_employee_creates_staff_group_and_guest(db_session: Session) -> None:
    event_id = _create_event(db_session)
    employee = _create_employee(db_session, f_document="12345678")

    result = staff_service.lodge_employee_in_event(db_session, employee.id, event_id)
    assert result is not None and result.created_guest is True

    group = db_session.query(GuestGroup).filter(GuestGroup.id == result.group_id).first()
    assert group is not None
    assert group.f_group_type == "staff"
    assert group.f_event_id == event_id

    guest = db_session.query(Guest).filter(Guest.id == result.guest_id).first()
    assert guest is not None
    assert guest.f_full_name == "Moshe Cohen"
    assert guest.f_guest_type == "staff"

    # idempotente: segundo lodge reusa grupo e hóspede
    again = staff_service.lodge_employee_in_event(db_session, employee.id, event_id)
    assert again is not None and again.created_guest is False
    assert again.group_id == result.group_id
    assert again.guest_id == result.guest_id


def test_lodge_employee_with_person_links_guest_to_person(db_session: Session) -> None:
    event_id = _create_event(db_session)
    client = client_service.create_client(
        db_session, client_schemas.ClientCreate(f_name="Família Cohen")
    )
    person = client_service.create_person(
        db_session, client.id, client_schemas.PersonCreate(f_full_name="Moshe Cohen")
    )

    employee = _create_employee(db_session, f_person_id=person.id)
    result = staff_service.lodge_employee_in_event(db_session, employee.id, event_id)
    assert result is not None

    guest = db_session.query(Guest).filter(Guest.id == result.guest_id).first()
    assert guest is not None
    assert guest.f_person_id == person.id
