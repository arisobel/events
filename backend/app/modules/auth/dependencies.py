"""Authentication module - FastAPI dependencies for authentication and authorization."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.security import decode_token
from . import service, models, schemas


# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> models.User:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        db: Database session
        token: JWT token from Authorization header
        
    Returns:
        User model instance
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    # Get user_id from token
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    user = service.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    
    # Check if user is active
    if user.f_is_active != 'T':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """
    Dependency to ensure current user is active.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        User model instance
        
    Raises:
        HTTPException: If user is inactive
    """
    if current_user.f_is_active != 'T':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


class RoleChecker:
    """Dependency class for checking user roles."""
    
    def __init__(self, required_roles: List[str]):
        """
        Initialize with required roles.
        
        Args:
            required_roles: List of role names that are allowed
        """
        self.required_roles = required_roles
    
    def __call__(
        self,
        current_user: models.User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ) -> models.User:
        """
        Check if current user has required role.
        
        Args:
            current_user: Current authenticated user
            db: Database session
            
        Returns:
            User model instance if authorized
            
        Raises:
            HTTPException: If user doesn't have required role
        """
        user_roles = service.get_user_roles(db, current_user.id)
        
        # Check if user has any of the required roles
        if not any(role in user_roles for role in self.required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have required role. Required: {', '.join(self.required_roles)}"
            )
        
        return current_user


def require_role(role_name: str):
    """
    Helper function to create a role checker dependency.
    
    Args:
        role_name: Name of the required role
        
    Returns:
        RoleChecker instance
        
    Usage:
        @app.get("/admin")
        def admin_only(user: User = Depends(require_role("admin"))):
            ...
    """
    return RoleChecker([role_name])
