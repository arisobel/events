"""Finance module - FastAPI routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User
from . import service, schemas

router = APIRouter(tags=["Finance"])


@router.get("/events/{event_id}/room-grid", response_model=schemas.RoomGridResponse)
def get_room_grid(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Grade de ocupação: quartos do hotel do evento × alocações com status financeiro."""
    grid = service.get_event_room_grid(db, event_id)
    if not grid:
        raise HTTPException(status_code=404, detail="Event not found")
    return grid


@router.get("/events/{event_id}/financial-summary", response_model=schemas.FinancialSummaryResponse)
def get_financial_summary(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Resumo financeiro do evento: receita esperada/recebida/pendente e ocupação."""
    summary = service.get_event_financial_summary(db, event_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Event not found")
    return summary


@router.get("/events/{event_id}/groups/{group_id}/invoice", response_model=schemas.InvoiceResponse)
def get_group_invoice(
    event_id: int,
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Extrato do grupo/família: reservas, quartos, noites, totais, pago e saldo."""
    invoice = service.get_group_invoice(db, event_id, group_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Group not found for event")
    return invoice
