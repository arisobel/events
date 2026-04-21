"""Authentication module - Pydantic schemas."""
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    """Base user schema."""
    f_username: str
    f_email: Optional[EmailStr] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    f_email: Optional[EmailStr] = None
    f_is_active: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""
    id: int
    f_is_active: str
    f_created_at: datetime
    roles: List[str] = []
    
    model_config = ConfigDict(from_attributes=True)


# Auth schemas
class UserLogin(BaseModel):
    """Schema for user login."""
    username: str
    password: str


class Token(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: int
    username: str
    roles: List[str] = []


# Role schemas
class RoleBase(BaseModel):
    """Base role schema."""
    f_name: str
    f_notes: Optional[str] = None


class RoleCreate(RoleBase):
    """Schema for creating a role."""
    pass


class RoleResponse(RoleBase):
    """Schema for role response."""
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# Audit log schemas
class AuditLogCreate(BaseModel):
    """Schema for creating an audit log entry."""
    f_user_id: Optional[int] = None
    f_entity_name: str
    f_entity_id: Optional[int] = None
    f_action: str
    f_old_value: Optional[str] = None
    f_new_value: Optional[str] = None


class AuditLogResponse(AuditLogCreate):
    """Schema for audit log response."""
    id: int
    f_created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
