"""Authentication module - SQLAlchemy models."""
from sqlalchemy import Column, Integer, String, CHAR, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class User(Base):
    """User model for authentication."""
    __tablename__ = "t_user"
    
    id = Column(Integer, primary_key=True, index=True)
    f_username = Column(String(100), unique=True, nullable=False, index=True)
    f_password_hash = Column(Text, nullable=False)
    f_email = Column(String(150))
    f_is_active = Column(CHAR(1), default='T')
    f_created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_roles = relationship("UserRole", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Role(Base):
    """Role model for authorization."""
    __tablename__ = "t_role"
    
    id = Column(Integer, primary_key=True, index=True)
    f_name = Column(String(100), unique=True, nullable=False, index=True)
    f_notes = Column(Text)
    
    # Relationships
    user_roles = relationship("UserRole", back_populates="role")


class UserRole(Base):
    """Association table between users and roles."""
    __tablename__ = "t_user_role"
    
    id = Column(Integer, primary_key=True, index=True)
    f_user_id = Column(Integer, ForeignKey("t_user.id"), nullable=False)
    f_role_id = Column(Integer, ForeignKey("t_role.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")


class AuditLog(Base):
    """Audit log for tracking important actions."""
    __tablename__ = "t_audit_log"
    
    id = Column(Integer, primary_key=True, index=True)
    f_user_id = Column(Integer, ForeignKey("t_user.id"))
    f_entity_name = Column(String(100))
    f_entity_id = Column(Integer)
    f_action = Column(String(50))
    f_old_value = Column(Text)
    f_new_value = Column(Text)
    f_created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
