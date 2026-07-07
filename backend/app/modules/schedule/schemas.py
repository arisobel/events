"""Schedule module - Pydantic schemas.

Nota: o campo se chama `f_date` (não `date`), então não há o problema de
shadowing do tipo `date` que atingiu o módulo clients. Ainda assim usamos o
alias `date_type` por clareza.
"""
from datetime import date as date_type
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator

# Tipos derivados do programa real de Pessach (cores do documento impresso):
# religioso (marrom), refeicao (verde), infantil (laranja), palestra (bege),
# entretenimento (piscina/ACAD), geral (check-in, avisos)
ActivityType = Literal["religioso", "refeicao", "infantil", "palestra", "entretenimento", "geral"]
# 'youth' = Jovens; segmentação por idioma (Português/Inglês) fica em nota por ora
Audience = Literal["all", "men", "women", "children", "youth"]

_TIME_RE = None  # regex compilada sob demanda em _validate_time


def _validate_time(value: Optional[str]) -> Optional[str]:
    if value is None or value == "":
        return None
    import re

    if not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", value):
        raise ValueError("Horário deve estar no formato HH:MM (00:00–23:59)")
    return value


class ActivityBase(BaseModel):
    f_title: str
    f_activity_type: ActivityType = "geral"
    f_audience: Audience = "all"
    f_space_id: Optional[int] = None  # espaço estruturado; f_location vira fallback
    f_location: Optional[str] = None
    f_instructor_id: Optional[int] = None  # ministrante (Employee raiz, Fatia 4)
    f_date: date_type
    f_start_time: str
    f_end_time: Optional[str] = None
    f_description: Optional[str] = None
    f_sort_order: int = 0

    @field_validator("f_start_time")
    @classmethod
    def _check_start(cls, v: str) -> str:
        validated = _validate_time(v)
        if validated is None:
            raise ValueError("Horário de início é obrigatório (HH:MM)")
        return validated

    @field_validator("f_end_time")
    @classmethod
    def _check_end(cls, v: Optional[str]) -> Optional[str]:
        return _validate_time(v)


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    f_title: Optional[str] = None
    f_activity_type: Optional[ActivityType] = None
    f_audience: Optional[Audience] = None
    f_space_id: Optional[int] = None
    f_location: Optional[str] = None
    f_instructor_id: Optional[int] = None
    f_date: Optional[date_type] = None
    f_start_time: Optional[str] = None
    f_end_time: Optional[str] = None
    f_description: Optional[str] = None
    f_sort_order: Optional[int] = None

    @field_validator("f_start_time", "f_end_time")
    @classmethod
    def _check_times(cls, v: Optional[str]) -> Optional[str]:
        return _validate_time(v)


class ActivityResponse(ActivityBase):
    id: int
    f_event_id: int
    space_name: Optional[str] = None  # nome do espaço resolvido (property do model)
    instructor_name: Optional[str] = None  # nome do ministrante resolvido
    f_created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
