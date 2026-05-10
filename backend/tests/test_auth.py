import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.modules.auth import dependencies as auth_dependencies
from app.modules.auth import service as auth_service


def test_login_success(db_session: Session, active_user) -> None:
    user = auth_service.authenticate_user(db_session, active_user.f_username, "admin123")

    assert user is not None
    token = create_access_token(
        {
            "sub": str(user.id),
            "username": user.f_username,
            "roles": [],
        }
    )
    assert token


def test_login_invalid_credentials(db_session: Session, active_user) -> None:
    user = auth_service.authenticate_user(db_session, active_user.f_username, "wrong-password")

    assert user is None


def test_protected_endpoint_without_token(db_session: Session) -> None:
    with pytest.raises(HTTPException) as exc_info:
        auth_dependencies.get_current_user(db=db_session, token="")

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Could not validate credentials"
