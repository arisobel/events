import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.auth import schemas as auth_schemas
from app.modules.auth import service as auth_service
from app.modules.auth.dependencies import require_admin, require_financial_access


def _make_user(db: Session, username: str):
    return auth_service.create_user(
        db, auth_schemas.UserCreate(f_username=username, f_email=None, password="x")
    )


def test_ensure_rbac_seed_creates_roles_and_bootstraps_admin(db_session: Session) -> None:
    user = _make_user(db_session, "first_admin")

    auth_service.ensure_rbac_seed(db_session)

    # os 3 papéis padrão existem
    for name in ("admin", "gestor_financeiro", "gestor_campo"):
        assert auth_service.get_role_by_name(db_session, name) is not None

    # o primeiro usuário virou admin
    assert "admin" in auth_service.get_user_roles(db_session, user.id)

    # idempotente: rodar de novo não duplica nem promove outro usuário
    other = _make_user(db_session, "campo_user")
    auth_service.ensure_rbac_seed(db_session)
    assert auth_service.get_user_roles(db_session, other.id) == []


def test_financial_access_denied_without_role_and_allowed_with_role(db_session: Session) -> None:
    auth_service.ensure_rbac_seed(db_session)
    user = _make_user(db_session, "campo")  # sem papel financeiro

    with pytest.raises(HTTPException) as exc:
        require_financial_access(current_user=user, db=db_session)
    assert exc.value.status_code == 403

    fin_role = auth_service.get_role_by_name(db_session, "gestor_financeiro")
    auth_service.assign_role_to_user(db_session, user.id, fin_role.id)
    # agora passa e devolve o próprio usuário
    assert require_financial_access(current_user=user, db=db_session) is user


def test_admin_bypasses_financial_gate(db_session: Session) -> None:
    auth_service.ensure_rbac_seed(db_session)
    admin = _make_user(db_session, "boss")
    admin_role = auth_service.get_role_by_name(db_session, "admin")
    auth_service.assign_role_to_user(db_session, admin.id, admin_role.id)

    # admin tem acesso financeiro e admin
    assert require_financial_access(current_user=admin, db=db_session) is admin
    assert require_admin(current_user=admin, db=db_session) is admin


def test_assign_and_remove_role(db_session: Session) -> None:
    auth_service.ensure_rbac_seed(db_session)
    user = _make_user(db_session, "temp")
    role = auth_service.get_role_by_name(db_session, "gestor_campo")

    auth_service.assign_role_to_user(db_session, user.id, role.id)
    assert auth_service.user_has_role(db_session, user.id, role.id) is True
    assert auth_service.remove_role_from_user(db_session, user.id, role.id) is True
    assert auth_service.user_has_role(db_session, user.id, role.id) is False
