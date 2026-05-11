"""Ensure a default admin user exists for local/Codespaces development."""
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.modules.auth import models, schemas, service


def main() -> None:
    db = SessionLocal()
    try:
        user = service.get_user_by_username(db, "admin")
        if not user:
            user = service.create_user(
                db,
                schemas.UserCreate(
                    f_username="admin",
                    f_email="admin@events.com",
                    password="admin123",
                ),
            )
            print("Created development admin user: admin")
        else:
            print("Development admin user already exists: admin")

        role = service.get_role_by_name(db, "admin")
        if not role:
            role = service.create_role(
                db,
                schemas.RoleCreate(
                    f_name="admin",
                    f_notes="Administrator role",
                ),
            )
            print("Created admin role")
        else:
            print("Admin role already exists")

        existing_assignment = (
            db.query(models.UserRole)
            .filter(
                models.UserRole.f_user_id == user.id,
                models.UserRole.f_role_id == role.id,
            )
            .first()
        )
        if not existing_assignment:
            service.assign_role_to_user(db, user.id, role.id)
            print("Assigned admin role to development user")
        else:
            print("Development admin user already has admin role")
    finally:
        db.close()


if __name__ == "__main__":
    main()
