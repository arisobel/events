"""Fatias 4 e 5 do bloco Facilities+Staff (2026-07-07):
ministrante na Activity (Employee raiz) e reconexão das Tasks
(executor/líder via engajamento + link Task↔Activity)."""
from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.modules.events import schemas as event_schemas
from app.modules.events import service as event_service
from app.modules.hotel import schemas as hotel_schemas
from app.modules.hotel import service as hotel_service
from app.modules.schedule import schemas as schedule_schemas
from app.modules.schedule import service as schedule_service
from app.modules.staff import schemas as staff_schemas
from app.modules.staff import service as staff_service
from app.modules.tasks import schemas as task_schemas
from app.modules.tasks import service as task_service


def _setup(db_session: Session):
    """Hotel + evento + employee + engajamento; retorna (event_id, employee_id, assignment_id)."""
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
    employee = staff_service.create_employee(
        db_session,
        staff_schemas.EmployeeCreate(f_full_name="Rabino Cohen", f_default_role="ministrante"),
    )
    assignment = staff_service.create_assignment(
        db_session,
        event.id,
        staff_schemas.AssignmentCreate(
            f_employee_id=employee.id,
            f_role="ministrante",
            f_start_date=date(2027, 4, 1),
            f_end_date=date(2027, 4, 10),
        ),
    )
    return event.id, employee.id, assignment.id


def _other_event_assignment(db_session: Session, employee_id: int) -> int:
    """Engajamento do mesmo employee em OUTRO evento (para testar pertencimento)."""
    hotel = hotel_service.create_hotel(db_session, hotel_schemas.HotelCreate(f_name="Outro Hotel"))
    event = event_service.create_event(
        db_session,
        event_schemas.EventCreate(
            f_hotel_id=hotel.id,
            f_name="Sucot 2027",
            f_event_type="holiday",
            f_start_date="2027-09-25",
            f_end_date="2027-10-05",
        ),
    )
    assignment = staff_service.create_assignment(
        db_session,
        event.id,
        staff_schemas.AssignmentCreate(f_employee_id=employee_id, f_role="monitor"),
    )
    return assignment.id


# ---- Fatia 4: ministrante na Activity ----

def test_activity_with_instructor_resolves_name(db_session: Session) -> None:
    event_id, employee_id, _ = _setup(db_session)

    activity = schedule_service.create_activity(
        db_session,
        event_id,
        schedule_schemas.ActivityCreate(
            f_title="Shiur da manhã",
            f_activity_type="palestra",
            f_instructor_id=employee_id,
            f_date=date(2027, 4, 2),
            f_start_time="10:00",
        ),
    )

    assert activity.f_instructor_id == employee_id
    assert activity.instructor_name == "Rabino Cohen"
    payload = schedule_schemas.ActivityResponse.model_validate(activity)
    assert payload.instructor_name == "Rabino Cohen"


def test_activity_missing_instructor_rejected(db_session: Session) -> None:
    event_id, _, _ = _setup(db_session)

    with pytest.raises(ValueError, match="not found"):
        schedule_service.create_activity(
            db_session,
            event_id,
            schedule_schemas.ActivityCreate(
                f_title="Palestra fantasma",
                f_instructor_id=9999,
                f_date=date(2027, 4, 2),
                f_start_time="11:00",
            ),
        )


def test_activity_update_instructor_and_clear(db_session: Session) -> None:
    event_id, employee_id, _ = _setup(db_session)
    activity = schedule_service.create_activity(
        db_session,
        event_id,
        schedule_schemas.ActivityCreate(
            f_title="Mincha", f_date=date(2027, 4, 3), f_start_time="18:30"
        ),
    )
    assert activity.f_instructor_id is None

    updated = schedule_service.update_activity(
        db_session, activity.id, schedule_schemas.ActivityUpdate(f_instructor_id=employee_id)
    )
    assert updated is not None and updated.instructor_name == "Rabino Cohen"

    cleared = schedule_service.update_activity(
        db_session, activity.id, schedule_schemas.ActivityUpdate(f_instructor_id=None)
    )
    assert cleared is not None and cleared.f_instructor_id is None


# ---- Fatia 5: executor/líder (engajamento) + link Task↔Activity ----

def test_task_with_executor_and_leader_resolves_names(db_session: Session) -> None:
    event_id, _, assignment_id = _setup(db_session)

    task = task_service.create_task(
        db_session,
        task_schemas.TaskCreate(
            f_event_id=event_id,
            f_title="Montar bimá",
            f_assigned_to_staff_id=assignment_id,
            f_leader_staff_id=assignment_id,
        ),
    )

    assert task.f_assigned_to_staff_id == assignment_id
    assert task.assigned_staff_name == "Rabino Cohen"
    assert task.leader_staff_name == "Rabino Cohen"
    payload = task_schemas.TaskResponse.model_validate(task)
    assert payload.assigned_staff_name == "Rabino Cohen"
    assert payload.leader_staff_name == "Rabino Cohen"


def test_task_assignment_from_other_event_rejected(db_session: Session) -> None:
    event_id, employee_id, _ = _setup(db_session)
    foreign_assignment_id = _other_event_assignment(db_session, employee_id)

    with pytest.raises(ValueError, match="does not belong"):
        task_service.create_task(
            db_session,
            task_schemas.TaskCreate(
                f_event_id=event_id,
                f_title="Task com staff de outro evento",
                f_assigned_to_staff_id=foreign_assignment_id,
            ),
        )


def test_task_missing_leader_assignment_rejected(db_session: Session) -> None:
    event_id, _, _ = _setup(db_session)

    with pytest.raises(ValueError, match="Leader.*not found"):
        task_service.create_task(
            db_session,
            task_schemas.TaskCreate(
                f_event_id=event_id,
                f_title="Task com líder inexistente",
                f_leader_staff_id=9999,
            ),
        )


def test_task_linked_to_activity_resolves_title(db_session: Session) -> None:
    event_id, _, _ = _setup(db_session)
    activity = schedule_service.create_activity(
        db_session,
        event_id,
        schedule_schemas.ActivityCreate(
            f_title="Jantar de Yom Tov",
            f_activity_type="refeicao",
            f_date=date(2027, 4, 1),
            f_start_time="20:00",
        ),
    )

    task = task_service.create_task(
        db_session,
        task_schemas.TaskCreate(
            f_event_id=event_id,
            f_title="Montar mesas do jantar",
            f_activity_id=activity.id,
        ),
    )

    assert task.f_activity_id == activity.id
    assert task.activity_title == "Jantar de Yom Tov"
    payload = task_schemas.TaskResponse.model_validate(task)
    assert payload.activity_title == "Jantar de Yom Tov"


def test_task_activity_from_other_event_rejected(db_session: Session) -> None:
    event_id, employee_id, _ = _setup(db_session)
    # atividade em outro evento
    other_assignment_id = _other_event_assignment(db_session, employee_id)
    from app.modules.staff import service as staff_svc

    other_event_id = staff_svc.get_assignment(db_session, other_assignment_id).f_event_id
    foreign_activity = schedule_service.create_activity(
        db_session,
        other_event_id,
        schedule_schemas.ActivityCreate(
            f_title="Atividade alheia", f_date=date(2027, 9, 26), f_start_time="09:00"
        ),
    )

    with pytest.raises(ValueError, match="does not belong"):
        task_service.create_task(
            db_session,
            task_schemas.TaskCreate(
                f_event_id=event_id,
                f_title="Task ligada a atividade de outro evento",
                f_activity_id=foreign_activity.id,
            ),
        )


def test_update_task_sets_and_clears_links(db_session: Session) -> None:
    event_id, _, assignment_id = _setup(db_session)
    activity = schedule_service.create_activity(
        db_session,
        event_id,
        schedule_schemas.ActivityCreate(
            f_title="Seder", f_activity_type="refeicao", f_date=date(2027, 4, 1), f_start_time="21:00"
        ),
    )
    task = task_service.create_task(
        db_session, task_schemas.TaskCreate(f_event_id=event_id, f_title="Preparar Seder")
    )

    updated = task_service.update_task(
        db_session,
        task.id,
        task_schemas.TaskUpdate(
            f_assigned_to_staff_id=assignment_id,
            f_leader_staff_id=assignment_id,
            f_activity_id=activity.id,
        ),
    )
    assert updated is not None
    assert updated.assigned_staff_name == "Rabino Cohen"
    assert updated.activity_title == "Seder"

    cleared = task_service.update_task(
        db_session,
        task.id,
        task_schemas.TaskUpdate(f_assigned_to_staff_id=None, f_activity_id=None),
    )
    assert cleared is not None
    assert cleared.f_assigned_to_staff_id is None
    assert cleared.f_activity_id is None
    # líder não foi tocado no segundo update (exclude_unset)
    assert cleared.f_leader_staff_id == assignment_id


def test_update_task_does_not_change_status(db_session: Session) -> None:
    """Status muda só via update_task_status (gera histórico) — o update geral ignora."""
    event_id, _, _ = _setup(db_session)
    task = task_service.create_task(
        db_session, task_schemas.TaskCreate(f_event_id=event_id, f_title="Task de status")
    )

    updated = task_service.update_task(
        db_session, task.id, task_schemas.TaskUpdate(f_status="completed", f_title="Renomeada")
    )
    assert updated is not None
    assert updated.f_title == "Renomeada"
    assert updated.f_status == "pending"
