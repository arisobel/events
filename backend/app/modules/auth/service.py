"""Authentication module - business logic service layer."""
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.security import verify_password, get_password_hash
from . import models, schemas


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """Get user by username."""
    return db.query(models.User).filter(models.User.f_username == username).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        f_username=user.f_username,
        f_email=user.f_email,
        f_password_hash=hashed_password,
        f_is_active='T'
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """
    Authenticate a user by username and password.
    Returns the user if authentication successful, None otherwise.
    """
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.f_password_hash):
        return None
    if user.f_is_active != 'T':
        return None
    return user


def get_user_roles(db: Session, user_id: int) -> List[str]:
    """Get list of role names for a user."""
    user_roles = (
        db.query(models.Role.f_name)
        .join(models.UserRole)
        .filter(models.UserRole.f_user_id == user_id)
        .all()
    )
    return [role[0] for role in user_roles]


def create_role(db: Session, role: schemas.RoleCreate) -> models.Role:
    """Create a new role."""
    db_role = models.Role(
        f_name=role.f_name,
        f_notes=role.f_notes
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def get_role_by_name(db: Session, name: str) -> Optional[models.Role]:
    """Get role by name."""
    return db.query(models.Role).filter(models.Role.f_name == name).first()


def assign_role_to_user(db: Session, user_id: int, role_id: int) -> models.UserRole:
    """Assign a role to a user."""
    user_role = models.UserRole(f_user_id=user_id, f_role_id=role_id)
    db.add(user_role)
    db.commit()
    db.refresh(user_role)
    return user_role


def log_audit(
    db: Session,
    entity_name: str,
    action: str,
    user_id: Optional[int] = None,
    entity_id: Optional[int] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None
) -> models.AuditLog:
    """Create an audit log entry."""
    audit_log = models.AuditLog(
        f_user_id=user_id,
        f_entity_name=entity_name,
        f_entity_id=entity_id,
        f_action=action,
        f_old_value=old_value,
        f_new_value=new_value
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log
