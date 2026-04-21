"""
Base class for SQLAlchemy models.
"""
from sqlalchemy.ext.declarative import declarative_base

# Create Base class for all models
Base = declarative_base()

# Note: Models are imported in alembic/env.py for autogenerate
# to avoid circular import issues with the application
