import os
import sys
from pathlib import Path
from typing import Generator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DEBUG"] = "false"
os.environ["DATABASE_URL"] = "sqlite://"

from app.core.security import get_password_hash
from app.db.base import Base
from app.modules.auth import models as auth_models
from app.modules.clients import models as client_models
from app.modules.events import models as event_models
from app.modules.finance import models as finance_models
from app.modules.guests import models as guest_models
from app.modules.hotel import models as hotel_models
from app.modules.rooms import models as room_models
from app.modules.tasks import models as task_models


SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    try:
        yield
    finally:
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(database: None) -> Generator[Session, None, None]:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def active_user(db_session: Session) -> auth_models.User:
    user = auth_models.User(
        f_username="admin",
        f_email="admin@example.com",
        f_password_hash=get_password_hash("admin123"),
        f_is_active="T",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
