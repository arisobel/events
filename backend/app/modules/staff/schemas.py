"""Staff module - Pydantic schemas.

Campos de custo (salário) são informação financeira: o router zera esses campos
na resposta para usuários sem acesso financeiro e rejeita escrita deles (403).
"""
from datetime import date as date_type
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, model_validator


class EmployeeBase(BaseModel):
    f_full_name: str
    f_default_role: Optional[str] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_default_daily_cost: Optional[Decimal] = None
    f_notes: Optional[str] = None
    f_person_id: Optional[int] = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    f_full_name: Optional[str] = None
    f_default_role: Optional[str] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_default_daily_cost: Optional[Decimal] = None
    f_notes: Optional[str] = None
    f_person_id: Optional[int] = None
    f_is_active: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: int
    f_is_active: str
    f_created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AssignmentBase(BaseModel):
    f_role: Optional[str] = None
    f_start_date: Optional[date_type] = None
    f_end_date: Optional[date_type] = None
    f_daily_cost: Optional[Decimal] = None
    f_total_cost: Optional[Decimal] = None
    f_notes: Optional[str] = None

    @model_validator(mode="after")
    def _check_dates(self):
        if self.f_start_date and self.f_end_date and self.f_start_date > self.f_end_date:
            raise ValueError("Assignment start date must be before or equal to end date")
        return self


class AssignmentCreate(AssignmentBase):
    f_employee_id: int


class AssignmentUpdate(AssignmentBase):
    pass


class AssignmentResponse(AssignmentBase):
    id: int
    f_event_id: int
    f_employee_id: int
    employee_name: Optional[str] = None
    work_days: Optional[int] = None
    effective_daily_cost: Optional[Decimal] = None
    derived_total_cost: Optional[Decimal] = None
    f_created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LodgeResult(BaseModel):
    group_id: int
    guest_id: int
    created_guest: bool  # False = hóspede desse colaborador já existia no grupo Staff
