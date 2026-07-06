"""Clients module - Pydantic schemas."""
from datetime import date
from datetime import date as date_type  # alias p/ anotar o campo StatementEntry.date sem shadowing
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator


def _normalize_country_code(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().upper()
    return normalized or None


def _normalize_lower(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    return normalized or None


# ---- Person ----
class PersonBase(BaseModel):
    f_full_name: str
    f_gender: Optional[str] = None
    f_birth_date: Optional[date] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_is_primary: bool = False
    f_notes: Optional[str] = None

    @field_validator("f_gender", mode="before")
    @classmethod
    def normalize_gender(cls, value: str | None) -> str | None:
        return _normalize_lower(value)


class PersonCreate(PersonBase):
    pass


class PersonUpdate(BaseModel):
    f_full_name: Optional[str] = None
    f_gender: Optional[str] = None
    f_birth_date: Optional[date] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_is_primary: Optional[bool] = None
    f_notes: Optional[str] = None

    @field_validator("f_gender", mode="before")
    @classmethod
    def normalize_gender(cls, value: str | None) -> str | None:
        return _normalize_lower(value)


class PersonResponse(PersonBase):
    id: int
    f_client_id: int

    model_config = ConfigDict(from_attributes=True)


# ---- Client ----
class ClientBase(BaseModel):
    f_name: str
    f_client_type: Optional[str] = None
    f_nationality: Optional[str] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_notes: Optional[str] = None

    @field_validator("f_nationality", mode="before")
    @classmethod
    def normalize_nationality(cls, value: str | None) -> str | None:
        return _normalize_country_code(value)


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    f_name: Optional[str] = None
    f_client_type: Optional[str] = None
    f_nationality: Optional[str] = None
    f_document: Optional[str] = None
    f_phone: Optional[str] = None
    f_email: Optional[str] = None
    f_notes: Optional[str] = None

    @field_validator("f_nationality", mode="before")
    @classmethod
    def normalize_nationality(cls, value: str | None) -> str | None:
        return _normalize_country_code(value)


class ClientResponse(ClientBase):
    id: int
    persons: List[PersonResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ---- Participação por evento (grupos ligados a este cliente) ----
class ClientEventLink(BaseModel):
    event_id: int
    event_name: str
    group_id: int
    group_name: str


class ImportClientToEventResult(BaseModel):
    group_id: int
    persons_imported: int


# ---- Conta corrente (extrato) ----
LedgerEntryType = Literal["debit", "credit"]


class LedgerEntryCreate(BaseModel):
    f_entry_type: LedgerEntryType
    f_amount: Decimal
    f_date: Optional[date] = None
    f_description: str
    f_notes: Optional[str] = None


class LedgerEntryResponse(BaseModel):
    id: int
    f_client_id: int
    f_entry_type: LedgerEntryType
    f_amount: Decimal
    f_date: date
    f_description: str
    f_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StatementEntry(BaseModel):
    # o campo se chama "date" (chave no JSON), mas o TIPO precisa vir do alias:
    # se anotar como `Optional[date]`, o nome do campo faz shadowing do tipo e o Pydantic
    # infere NoneType -> qualquer data real quebra com 500.
    date: Optional[date_type] = None
    entry_type: LedgerEntryType
    amount: Decimal
    description: str
    source: Literal["reservation", "payment", "manual"]
    event_id: Optional[int] = None
    event_name: Optional[str] = None
    reservation_id: Optional[int] = None
    ledger_entry_id: Optional[int] = None  # presente só em lançamentos manuais (permite excluir)


class ClientStatementResponse(BaseModel):
    client_id: int
    entries: List[StatementEntry] = []
    total_debit: Decimal
    total_credit: Decimal
    balance: Decimal  # credit - debit (negativo = cliente deve)


class ClientOpenReservation(BaseModel):
    """Reserva do cliente com saldo em aberto — alvo para 'dar baixa' de um crédito."""
    event_id: int
    event_name: str
    reservation_id: int
    grand_total: Decimal
    paid: Decimal
    balance: Decimal
