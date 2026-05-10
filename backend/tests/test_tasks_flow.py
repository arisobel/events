from sqlalchemy.orm import Session

from app.modules.tasks import schemas as task_schemas
from app.modules.tasks import service as task_service

from .test_mvp_occupancy import create_hotel_event_and_room


def test_tasks_flow_still_works(db_session: Session) -> None:
    _, _, event_id = create_hotel_event_and_room(db_session)

    task = task_service.create_task(
        db_session,
        task_schemas.TaskCreate(
            f_event_id=event_id,
            f_title="Prepare conference hall",
            f_description="Set chairs and projector",
            f_priority="high",
            f_task_type="setup",
        ),
    )
    assert task.id is not None

    tasks = task_service.get_event_tasks(db_session, event_id)
    assert len(tasks) == 1

    updated_task = task_service.update_task_status(db_session, task.id, "in_progress", staff_id=None)
    assert updated_task is not None
    assert updated_task.f_status == "in_progress"
