"""Staff module - SQLAlchemy models (Fatia 3 do bloco Facilities+Staff, decisão 2026-07-07).

Employee: entidade raiz (atravessa eventos), espelhando o padrão Cliente+Pessoas —
Person é a identidade; Client = lado da receita; Employee = lado do custo.
f_person_id opcional liga ao cadastro raiz quando o colaborador também existe na
base de clientes (ex.: rabino que vem com a família).

EventStaffAssignment: engajamento por evento — função, período e custo ficam AQUI
(a mesma pessoa é monitor num evento e ministrante em outro). Custo padrão no
Employee com override no engajamento — mesmo padrão do preço base do quarto +
override por evento. O custo derivado alimenta o P&L do evento (backlog).
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import CHAR, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Employee(Base):
    __tablename__ = "t_employee"

    id = Column(Integer, primary_key=True, index=True)
    f_person_id = Column(Integer, ForeignKey("t_person.id"))  # vínculo raiz opcional
    f_full_name = Column(String(150), nullable=False)
    f_default_role = Column(String(50))  # mashguiach, monitor, cozinha, manutenção...
    f_document = Column(String(50))
    f_phone = Column(String(50))
    f_email = Column(String(150))
    f_default_daily_cost = Column(Numeric(10, 2))  # custo/dia padrão; override no engajamento
    f_notes = Column(Text)
    f_is_active = Column(CHAR(1), default='T')
    f_created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person")
    assignments = relationship("EventStaffAssignment", back_populates="employee")


class EventStaffAssignment(Base):
    __tablename__ = "t_event_staff"

    id = Column(Integer, primary_key=True, index=True)
    f_event_id = Column(Integer, ForeignKey("t_event.id"), nullable=False, index=True)
    f_employee_id = Column(Integer, ForeignKey("t_employee.id"), nullable=False, index=True)
    f_role = Column(String(50))
    # período de trabalho pode exceder a janela do evento (ex.: kasherização D-5)
    f_start_date = Column(Date)
    f_end_date = Column(Date)
    f_daily_cost = Column(Numeric(10, 2))  # override do padrão do employee
    f_total_cost = Column(Numeric(10, 2))  # valor fechado; autoritativo se preenchido
    f_notes = Column(Text)
    f_created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="assignments")

    @property
    def employee_name(self) -> Optional[str]:
        return self.employee.f_full_name if self.employee else None

    @property
    def work_days(self) -> Optional[int]:
        """Dias trabalhados, inclusivo nas duas pontas (diferente de noites de quarto)."""
        if self.f_start_date and self.f_end_date:
            return (self.f_end_date - self.f_start_date).days + 1
        return None

    @property
    def effective_daily_cost(self) -> Optional[Decimal]:
        if self.f_daily_cost is not None:
            return Decimal(self.f_daily_cost)
        if self.employee and self.employee.f_default_daily_cost is not None:
            return Decimal(self.employee.f_default_daily_cost)
        return None

    @property
    def derived_total_cost(self) -> Optional[Decimal]:
        """Custo do engajamento para o P&L: total fechado > diária efetiva × dias."""
        if self.f_total_cost is not None:
            return Decimal(self.f_total_cost)
        daily = self.effective_daily_cost
        days = self.work_days
        if daily is not None and days is not None:
            return daily * days
        return None
