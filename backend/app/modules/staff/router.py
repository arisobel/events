"""Staff module - FastAPI routes.

Operação de staff (quem trabalha, quando, em que função) é visível a qualquer
usuário ativo. CUSTO (salário) é informação financeira: os campos de custo são
zerados na resposta para quem não tem acesso financeiro, e a escrita deles
exige o papel financeiro (403 caso contrário) — coerente com o RBAC de 2026-07-06.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth import service as auth_service
from app.modules.auth.dependencies import (
    ROLE_ADMIN,
    ROLE_FINANCE,
    get_current_active_user,
)
from app.modules.auth.models import User

from . import schemas, service

router = APIRouter(tags=["Staff"])


def _can_see_financials(db: Session, user: User) -> bool:
    roles = auth_service.get_user_roles(db, user.id)
    return ROLE_ADMIN in roles or ROLE_FINANCE in roles


def _require_financial_for_costs(db: Session, user: User, *costs) -> None:
    if any(c is not None for c in costs) and not _can_see_financials(db, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Setting staff costs requires financial access",
        )


def _employee_response(employee, show_costs: bool) -> schemas.EmployeeResponse:
    resp = schemas.EmployeeResponse.model_validate(employee)
    if not show_costs:
        resp.f_default_daily_cost = None
    return resp


def _assignment_response(assignment, show_costs: bool) -> schemas.AssignmentResponse:
    resp = schemas.AssignmentResponse.model_validate(assignment)
    if not show_costs:
        resp.f_daily_cost = None
        resp.f_total_cost = None
        resp.effective_daily_cost = None
        resp.derived_total_cost = None
    return resp


# ---- Employees ----

@router.get("/staff/employees", response_model=List[schemas.EmployeeResponse])
def list_employees(
    search: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    show_costs = _can_see_financials(db, current_user)
    employees = service.list_employees(db, search=search, include_inactive=include_inactive)
    return [_employee_response(e, show_costs) for e in employees]


@router.post(
    "/staff/employees",
    response_model=schemas.EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    employee: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_financial_for_costs(db, current_user, employee.f_default_daily_cost)
    try:
        created = service.create_employee(db, employee)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _employee_response(created, _can_see_financials(db, current_user))


@router.get("/staff/employees/{employee_id}", response_model=schemas.EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    employee = service.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _employee_response(employee, _can_see_financials(db, current_user))


@router.put("/staff/employees/{employee_id}", response_model=schemas.EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: schemas.EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_financial_for_costs(db, current_user, employee.f_default_daily_cost)
    try:
        updated = service.update_employee(db, employee_id, employee)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _employee_response(updated, _can_see_financials(db, current_user))


@router.delete("/staff/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        deleted = service.delete_employee(db, employee_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    if deleted is None:
        raise HTTPException(status_code=404, detail="Employee not found")


@router.get(
    "/staff/employees/{employee_id}/assignments",
    response_model=List[schemas.AssignmentResponse],
)
def list_employee_assignments(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.get_employee(db, employee_id):
        raise HTTPException(status_code=404, detail="Employee not found")
    show_costs = _can_see_financials(db, current_user)
    return [
        _assignment_response(a, show_costs)
        for a in service.get_employee_assignments(db, employee_id)
    ]


# ---- Assignments por evento ----

@router.get("/events/{event_id}/staff", response_model=List[schemas.AssignmentResponse])
def list_event_staff(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    show_costs = _can_see_financials(db, current_user)
    return [
        _assignment_response(a, show_costs)
        for a in service.get_event_assignments(db, event_id)
    ]


@router.post(
    "/events/{event_id}/staff",
    response_model=schemas.AssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event_staff(
    event_id: int,
    assignment: schemas.AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_financial_for_costs(
        db, current_user, assignment.f_daily_cost, assignment.f_total_cost
    )
    try:
        created = service.create_assignment(db, event_id, assignment)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _assignment_response(created, _can_see_financials(db, current_user))


@router.put("/staff/assignments/{assignment_id}", response_model=schemas.AssignmentResponse)
def update_assignment(
    assignment_id: int,
    assignment: schemas.AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _require_financial_for_costs(
        db, current_user, assignment.f_daily_cost, assignment.f_total_cost
    )
    try:
        updated = service.update_assignment(db, assignment_id, assignment)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not updated:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return _assignment_response(updated, _can_see_financials(db, current_user))


@router.delete("/staff/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.delete_assignment(db, assignment_id):
        raise HTTPException(status_code=404, detail="Assignment not found")


# ---- Staff hospedado ----

@router.post(
    "/staff/employees/{employee_id}/lodge/{event_id}",
    response_model=schemas.LodgeResult,
)
def lodge_employee(
    employee_id: int,
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Adiciona o colaborador como hóspede (GuestType=staff) no grupo Staff do evento."""
    try:
        result = service.lodge_employee_in_event(db, employee_id, event_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if result is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return result
