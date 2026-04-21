#!/usr/bin/env python3
"""
Bootstrap script to generate boilerplate files for backend modules.
Generates models, schemas, service, and router files for specified modules.
"""

import os
from pathlib import Path

# Module configurations: (module_name, models_to_create)
MODULES_CONFIG = {
    "events": {
        "models": ["Event", "EventPeriod", "EventSpace", "EventConfiguration"],
        "description": "Event management module"
    },
    "guests": {
        "models": ["GuestGroup", "Guest", "Reservation", "SpecialRequest"],
        "description": "Guest and reservation management module"
    },
    "rooms": {
        "models": ["RoomAllocation"],
        "description": "Room allocation module"
    },
    "tasks": {
        "models": ["Task", "TaskComment", "TaskStatusHistory"],
        "description": "Task management and execution module"
    },
}


def create_init_file(module_path: Path):
    """Create __init__.py for a module."""
    content = f'''"""Module initialization."""
from . import models, schemas, service, router

__all__ = ["models", "schemas", "service", "router"]
'''
    (module_path / "__init__.py").write_text(content)


def create_models_placeholder(module_path: Path, module_name: str, models: list):
    """Create models.py placeholder."""
    content = f'''"""
{module_name.capitalize()} module - SQLAlchemy models.
TODO: Complete model implementation based on DATABASE_PHASE1.sql
"""
from sqlalchemy import Column, Integer, String, CHAR, DateTime, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


# TODO: Implement models for: {", ".join(models)}
# Refer to /docs/DATABASE_PHASE1.sql for complete schema

'''
    (module_path / "models.py").write_text(content)


def create_schemas_placeholder(module_path: Path, module_name: str):
    """Create schemas.py placeholder."""
    content = f'''"""
{module_name.capitalize()} module - Pydantic schemas.
TODO: Complete schema implementation
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date


# TODO: Implement Create, Update, Response schemas for each model

'''
    (module_path / "schemas.py").write_text(content)


def create_service_placeholder(module_path: Path, module_name: str):
    """Create service.py placeholder."""
    content = f'''"""
{module_name.capitalize()} module - business logic service layer.
TODO: Complete service implementation
"""
from sqlalchemy.orm import Session
from typing import Optional, List
from . import models, schemas


# TODO: Implement CRUD functions for each model

'''
    (module_path / "service.py").write_text(content)


def create_router_placeholder(module_path: Path, module_name: str):
    """Create router.py placeholder."""
    content = f'''"""
{module_name.capitalize()} module - FastAPI routes.
TODO: Complete router implementation
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas


router = APIRouter(prefix="/{module_name}", tags=["{module_name.capitalize()}"])


# TODO: Implement API endpoints

'''
    (module_path / "router.py").write_text(content)


def main():
    """Generate boilerplate files for modules."""
    base_path = Path(__file__).parent / "app" / "modules"
    
    for module_name, config in MODULES_CONFIG.items():
        module_path = base_path / module_name
        module_path.mkdir(parents=True, exist_ok=True)
        
        print(f"Generating {module_name} module...")
        create_init_file(module_path)
        create_models_placeholder(module_path, module_name, config["models"])
        create_schemas_placeholder(module_path, module_name)
        create_service_placeholder(module_path, module_name)
        create_router_placeholder(module_path, module_name)
        
        print(f"  ✓ {module_name} module boilerplate created")
    
    print("\nAll module boilerplates generated!")
    print("Next steps:")
    print("  1. Complete model implementations in */models.py")
    print("  2. Add schemas in */schemas.py")
    print("  3. Implement services in */service.py")
    print("  4. Add API endpoints in */router.py")


if __name__ == "__main__":
    main()
