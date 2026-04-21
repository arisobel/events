"""Authentication module - FastAPI routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from . import service, schemas, models
from .dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


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
    
    # Create tokens
    token_data = {
        "sub": user.id,
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
