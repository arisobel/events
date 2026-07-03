"""Finance module - FastAPI routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
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


@router.get("/events/{event_id}/room-prices", response_model=List[schemas.EventRoomPriceResponse])
def list_event_room_prices(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Overrides de preço/noite dos quartos para o evento."""
    prices = service.get_event_room_prices(db, event_id)
    if prices is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return prices


@router.put("/events/{event_id}/room-prices/{room_id}", response_model=schemas.EventRoomPriceResponse)
def upsert_event_room_price(
    event_id: int,
    room_id: int,
    payload: schemas.EventRoomPriceUpsert,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Define (cria ou atualiza) o preço/noite do quarto para o evento."""
    try:
        return service.upsert_event_room_price(db, event_id, room_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/events/{event_id}/room-prices/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event_room_price(
    event_id: int,
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Remove o override de preço do evento; o quarto volta ao preço base."""
    deleted = service.delete_event_room_price(db, event_id, room_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event room price not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
