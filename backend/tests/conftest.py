import os
import sys
from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DEBUG"] = "false"
os.environ["DATABASE_URL"] = "sqlite://"

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.modules.auth import models as auth_models
from app.modules.events import models as event_models
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
def client(database: None) -> Generator[TestClient, None, None]:
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def active_user(database: None) -> auth_models.User:
    session = TestingSessionLocal()
    user = auth_models.User(
        f_username="admin",
        f_email="admin@example.com",
        f_password_hash=get_password_hash("admin123"),
        f_is_active="T",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    session.expunge(user)
    session.close()
    return user


@pytest.fixture()
def auth_headers(client: TestClient, active_user: auth_models.User) -> dict[str, str]:
    response = client.post(
        "/auth/login",
        data={"username": active_user.f_username, "password": "admin123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
