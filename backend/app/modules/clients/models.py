"""Clients module - SQLAlchemy models.

Entidades raiz (independentes de evento):
- Client: família ou organização permanente (recorre entre eventos)
- Person: pessoa permanente que pertence a um Client

A ligação com a operação por evento é feita por FKs opcionais em GuestGroup/Guest
(ver módulo guests), de forma incremental — nada existente quebra.
"""
from datetime import date

from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Client(Base):
    __tablename__ = "t_client"

    id = Column(Integer, primary_key=True, index=True)
    f_name = Column(String(150), nullable=False)
    f_client_type = Column(String(50))  # 'family' | 'company' (livre)
    f_nationality = Column(String(2))   # ISO 3166-1 alpha-2 (reaproveita a bandeira)
    f_document = Column(String(50))
    f_phone = Column(String(50))
    f_email = Column(String(150))
    f_notes = Column(Text)

    persons = relationship("Person", back_populates="client", cascade="all, delete-orphan")


class Person(Base):
    __tablename__ = "t_person"

    id = Column(Integer, primary_key=True, index=True)
    f_client_id = Column(Integer, ForeignKey("t_client.id"), nullable=False)
    f_full_name = Column(String(150), nullable=False)
    f_gender = Column(String(20))
    f_birth_date = Column(Date)
    f_document = Column(String(50))
    f_phone = Column(String(50))
    f_email = Column(String(150))
    f_is_primary = Column(Boolean, nullable=False, default=False)  # contato/titular principal
    f_notes = Column(Text)

    client = relationship("Client", back_populates="persons")


class LedgerEntry(Base):
    """Lançamento manual na conta corrente do cliente (ajustes fora das reservas).

    Débitos/créditos derivados das reservas e pagamentos NÃO ficam aqui — são
    calculados on-the-fly no extrato (get_client_statement). Esta tabela guarda só
    ajustes manuais: depósito, desconto, dívida antiga, multa, etc.
    """
    __tablename__ = "t_ledger_entry"

    id = Column(Integer, primary_key=True, index=True)
    f_client_id = Column(Integer, ForeignKey("t_client.id"), nullable=False)
    f_entry_type = Column(String(10), nullable=False)  # 'debit' | 'credit'
    f_amount = Column(Numeric(10, 2), nullable=False)
    f_date = Column(Date, nullable=False, default=date.today)
    f_description = Column(String(200), nullable=False)
    f_notes = Column(Text)
