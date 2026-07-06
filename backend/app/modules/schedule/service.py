"""Schedule module - service layer."""
from datetime import date as date_type
from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


def get_event_activities(
    db: Session,
    event_id: int,
    day: Optional[date_type] = None,
    activity_type: Optional[str] = None,
    audience: Optional[str] = None,
) -> List[models.Activity]:
    query = db.query(models.Activity).filter(models.Activity.f_event_id == event_id)
    if day is not None:
        query = query.filter(models.Activity.f_date == day)
    if activity_type:
        query = query.filter(models.Activity.f_activity_type == activity_type)
    if audience:
        # 'all' aparece para todos os públicos; um filtro específico traz o público + 'all'
        query = query.filter(models.Activity.f_audience.in_([audience, "all"]))
    return query.order_by(
        models.Activity.f_date,
        models.Activity.f_start_time,
        models.Activity.f_sort_order,
        models.Activity.id,
    ).all()


def get_activity(db: Session, activity_id: int) -> Optional[models.Activity]:
    return db.query(models.Activity).filter(models.Activity.id == activity_id).first()


def create_activity(db: Session, event_id: int, data: schemas.ActivityCreate) -> models.Activity:
    activity = models.Activity(f_event_id=event_id, **data.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def update_activity(
    db: Session, activity_id: int, data: schemas.ActivityUpdate
) -> Optional[models.Activity]:
    activity = get_activity(db, activity_id)
    if not activity:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.commit()
    db.refresh(activity)
    return activity


def delete_activity(db: Session, activity_id: int) -> bool:
    activity = get_activity(db, activity_id)
    if not activity:
        return False
    db.delete(activity)
    db.commit()
    return True
