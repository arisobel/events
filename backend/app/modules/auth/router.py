"""Authentication module - FastAPI routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from typing import List

from . import service, schemas, models
from .dependencies import get_current_user, require_admin


router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_response(db: Session, user: models.User) -> schemas.UserResponse:
    return schemas.UserResponse(
        id=user.id,
        f_username=user.f_username,
        f_email=user.f_email,
        f_is_active=user.f_is_active,
        f_created_at=user.f_created_at,
        roles=service.get_user_roles(db, user.id),
    )


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens.
    
    Args:
        form_data: OAuth2 form with username and password
        db: Database session
        
    Returns:
        Access and refresh tokens
        
    Raises:
        HTTPException: If authentication fails
    """
    # Authenticate user
    user = service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user roles
    user_roles = service.get_user_roles(db, user.id)
    
    # Create tokens (sub must be string as per JWT spec)
    token_data = {
        "sub": str(user.id),
        "username": user.f_username,
        "roles": user_roles
    }
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    
    # Log login action
    service.log_audit(
        db=db,
        user_id=user.id,
        entity_name="user",
        entity_id=user.id,
        action="login",
        new_value=f"User {user.f_username} logged in"
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=schemas.Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_token: Valid refresh token
        db: Database session
        
    Returns:
        New access and refresh tokens
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    # Decode refresh token
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id: int = payload.get("sub")
    user = service.get_user_by_id(db, user_id)
    
    if not user or user.f_is_active != 'T':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Get updated user roles
    user_roles = service.get_user_roles(db, user.id)
    
    # Create new tokens
    token_data = {
        "sub": user.id,
        "username": user.f_username,
        "roles": user_roles
    }
    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_info(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user from dependency
        db: Database session
        
    Returns:
        User information with roles
    """
    # Get user roles
    user_roles = service.get_user_roles(db, current_user.id)
    
    return schemas.UserResponse(
        id=current_user.id,
        f_username=current_user.f_username,
        f_email=current_user.f_email,
        f_is_active=current_user.f_is_active,
        f_created_at=current_user.f_created_at,
        f_language=current_user.f_language,
        roles=user_roles
    )


@router.put("/me/language", response_model=schemas.UserResponse)
def update_my_language(
    preference: schemas.LanguagePreference,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Salva a preferência de idioma da UI do próprio usuário (pt-BR | en | he)."""
    current_user.f_language = preference.f_language
    db.commit()
    db.refresh(current_user)
    user_roles = service.get_user_roles(db, current_user.id)
    return schemas.UserResponse(
        id=current_user.id,
        f_username=current_user.f_username,
        f_email=current_user.f_email,
        f_is_active=current_user.f_is_active,
        f_created_at=current_user.f_created_at,
        f_language=current_user.f_language,
        roles=user_roles
    )


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    Args:
        user: User creation data
        db: Database session
        
    Returns:
        Created user information
        
    Raises:
        HTTPException: If username already exists
    """
    # Check if username already exists
    existing_user = service.get_user_by_username(db, user.f_username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create user
    db_user = service.create_user(db, user)
    
    # Log user creation
    service.log_audit(
        db=db,
        entity_name="user",
        entity_id=db_user.id,
        action="create",
        new_value=f"User {db_user.f_username} created"
    )
    
    return schemas.UserResponse(
        id=db_user.id,
        f_username=db_user.f_username,
        f_email=db_user.f_email,
        f_is_active=db_user.f_is_active,
        f_created_at=db_user.f_created_at,
        roles=[]
    )


# ---- Administração de usuários e papéis (admin only) ----
@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(require_admin),
):
    return [_user_response(db, user) for user in service.list_users(db)]


@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(require_admin),
):
    if service.get_user_by_username(db, user.f_username):
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = service.create_user(db, user)
    return _user_response(db, db_user)


@router.get("/roles", response_model=List[schemas.RoleResponse])
def list_roles(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(require_admin),
):
    return service.list_roles(db)


@router.post("/users/{user_id}/roles/{role_id}", response_model=schemas.UserResponse)
def assign_role(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(require_admin),
):
    user = service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not service.user_has_role(db, user_id, role_id):
        service.assign_role_to_user(db, user_id, role_id)
    return _user_response(db, user)


@router.delete("/users/{user_id}/roles/{role_id}", response_model=schemas.UserResponse)
def remove_role(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    _admin: models.User = Depends(require_admin),
):
    user = service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    service.remove_role_from_user(db, user_id, role_id)
    return _user_response(db, user)
