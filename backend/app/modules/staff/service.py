"""Staff module - service layer."""
from typing import List, Optional

from sqlalchemy.orm import Session

from app.modules.clients.models import Person
from app.modules.events.models import Event
from app.modules.guests.models import Guest, GuestGroup

from . import models, schemas


STAFF_GROUP_NAME = "Staff"


# ---- Employees (entidade raiz) ----

def list_employees(
    db: Session, search: Optional[str] = None, include_inactive: bool = False
) -> List[models.Employee]:
    query = db.query(models.Employee)
    if not include_inactive:
        query = query.filter(models.Employee.f_is_active == 'T')
    if search:
        like = f"%{search}%"
        query = query.filter(models.Employee.f_full_name.ilike(like))
    return query.order_by(models.Employee.f_full_name).all()


def get_employee(db: Session, employee_id: int) -> Optional[models.Employee]:
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()


def _validate_person(db: Session, person_id: Optional[int]) -> None:
    if person_id is None:
        return
    if not db.query(Person).filter(Person.id == person_id).first():
        raise ValueError("Person not found")


def create_employee(db: Session, data: schemas.EmployeeCreate) -> models.Employee:
    _validate_person(db, data.f_person_id)
    employee = models.Employee(**data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update_employee(
    db: Session, employee_id: int, data: schemas.EmployeeUpdate
) -> Optional[models.Employee]:
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    update_data = data.model_dump(exclude_unset=True)
    if "f_person_id" in update_data:
        _validate_person(db, update_data["f_person_id"])
    for key, value in update_data.items():
        setattr(employee, key, value)
    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee_id: int) -> Optional[bool]:
    """Remove um colaborador. None se não existir; ValueError se tiver engajamentos."""
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    has_assignments = (
        db.query(models.EventStaffAssignment)
        .filter(models.EventStaffAssignment.f_employee_id == employee_id)
        .first()
    )
    if has_assignments:
        raise ValueError(
            "Employee has event assignments. Remove the assignments first (histórico de custo)."
        )
    db.delete(employee)
    db.commit()
    return True


# ---- Assignments (engajamento por evento) ----

def get_event_assignments(db: Session, event_id: int) -> List[models.EventStaffAssignment]:
    return (
        db.query(models.EventStaffAssignment)
        .filter(models.EventStaffAssignment.f_event_id == event_id)
        .order_by(models.EventStaffAssignment.id)
        .all()
    )


def get_employee_assignments(db: Session, employee_id: int) -> List[models.EventStaffAssignment]:
    return (
        db.query(models.EventStaffAssignment)
        .filter(models.EventStaffAssignment.f_employee_id == employee_id)
        .order_by(models.EventStaffAssignment.id)
        .all()
    )


def get_assignment(db: Session, assignment_id: int) -> Optional[models.EventStaffAssignment]:
    return (
        db.query(models.EventStaffAssignment)
        .filter(models.EventStaffAssignment.id == assignment_id)
        .first()
    )


def create_assignment(
    db: Session, event_id: int, data: schemas.AssignmentCreate
) -> models.EventStaffAssignment:
    if not db.query(Event).filter(Event.id == event_id).first():
        raise ValueError("Event not found")
    if not get_employee(db, data.f_employee_id):
        raise ValueError("Employee not found")
    assignment = models.EventStaffAssignment(f_event_id=event_id, **data.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def update_assignment(
    db: Session, assignment_id: int, data: schemas.AssignmentUpdate
) -> Optional[models.EventStaffAssignment]:
    assignment = get_assignment(db, assignment_id)
    if not assignment:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(assignment, key, value)
    if (
        assignment.f_start_date
        and assignment.f_end_date
        and assignment.f_start_date > assignment.f_end_date
    ):
        db.rollback()
        raise ValueError("Assignment start date must be before or equal to end date")
    db.commit()
    db.refresh(assignment)
    return assignment


def delete_assignment(db: Session, assignment_id: int) -> bool:
    assignment = get_assignment(db, assignment_id)
    if not assignment:
        return False
    db.delete(assignment)
    db.commit()
    return True


# ---- Staff hospedado (ponte para a máquina de alocação) ----

def lodge_employee_in_event(
    db: Session, employee_id: int, event_id: int
) -> Optional[schemas.LodgeResult]:
    """Cria (ou reusa) o grupo "Staff" do evento e adiciona o colaborador como Guest.

    A partir daí o colaborador entra na alocação de quartos / room grid / "onde está
    fulano?" pela máquina existente de Guests — sem código novo de alocação.
    GuestType = 'staff' (decisão 2026-05-11). Idempotente: se já houver hóspede do
    mesmo Person (ou mesmo nome) no grupo Staff, reusa em vez de duplicar.
    """
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    if not db.query(Event).filter(Event.id == event_id).first():
        raise ValueError("Event not found")

    group = (
        db.query(GuestGroup)
        .filter(
            GuestGroup.f_event_id == event_id,
            GuestGroup.f_group_type == "staff",
        )
        .first()
    )
    if not group:
        group = GuestGroup(
            f_event_id=event_id,
            f_name=STAFF_GROUP_NAME,
            f_group_type="staff",
            f_notes="Grupo automático para staff hospedado no hotel",
        )
        db.add(group)
        db.flush()

    existing_query = db.query(Guest).filter(Guest.f_group_id == group.id)
    if employee.f_person_id is not None:
        existing = existing_query.filter(Guest.f_person_id == employee.f_person_id).first()
    else:
        existing = existing_query.filter(Guest.f_full_name == employee.f_full_name).first()

    if existing:
        db.commit()
        return schemas.LodgeResult(group_id=group.id, guest_id=existing.id, created_guest=False)

    guest = Guest(
        f_group_id=group.id,
        f_person_id=employee.f_person_id,
        f_full_name=employee.f_full_name,
        f_document=employee.f_document,
        f_phone=employee.f_phone,
        f_email=employee.f_email,
        f_guest_type="staff",
        f_notes=f"Staff: {employee.f_default_role}" if employee.f_default_role else "Staff",
    )
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return schemas.LodgeResult(group_id=group.id, guest_id=guest.id, created_guest=True)
