"""
Base class for SQLAlchemy models.
Import all models here for Alembic autogenerate to work.
"""
from sqlalchemy.ext.declarative import declarative_base

# Create Base class for all models
Base = declarative_base()

# Import all models here for Alembic autogenerate
# This ensures Alembic can detect all models when creating migrations

# Auth models
from app.modules.auth.models import User, Role, UserRole, AuditLog  # noqa

# Hotel models  
from app.modules.hotel.models import (  # noqa
    Hotel, HotelSpace, HotelRoom, HotelKitchen, HotelTable
)

# Event models
from app.modules.events.models import (  # noqa
    Event, EventPeriod, EventSpace, EventConfiguration
)

# Guest models
from app.modules.guests.models import (  # noqa
    GuestGroup, Guest, Reservation, SpecialRequest
)

# Room allocation models
from app.modules.rooms.models import RoomAllocation  # noqa

# Task models
from app.modules.tasks.models import Task, TaskComment, TaskStatusHistory  # noqa

# Future modules - uncomment as they are implemented
# from app.modules.tables.models import TableAllocation  # noqa
# from app.modules.schedule.models import Activity, ActivityCategory  # noqa
# from app.modules.religious.models import Minyan, PrayerSchedule, Shiur  # noqa
# from app.modules.staff.models import Team, StaffMember, TeamMember, Shift  # noqa
# from app.modules.supervision.models import KanbanLane, TaskKanban, WorkloadSnapshot  # noqa
# from app.modules.kashrut.models import Mashguiach, MashguiachShift, KashrutChecklist  # noqa
# from app.modules.logistics.models import Supplier, Delivery, Equipment  # noqa
# from app.modules.rules.models import SpaceRule  # noqa
# from app.modules.lost_found.models import LostFoundItem, LostFoundClaim  # noqa
