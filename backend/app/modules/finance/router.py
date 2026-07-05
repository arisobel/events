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


# ---- Reservation extras ----

@router.get("/reservations/{reservation_id}/extras", response_model=List[schemas.ReservationExtraResponse])
def list_reservation_extras(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Itens adicionais cobrados na reserva (sala especial, sub-evento, serviço)."""
    return service.get_reservation_extras(db, reservation_id)


@router.post(
    "/reservations/{reservation_id}/extras",
    response_model=schemas.ReservationExtraResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reservation_extra(
    reservation_id: int,
    payload: schemas.ReservationExtraCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Adiciona um item extra à reserva; soma-se por cima da hospedagem."""
    try:
        return service.create_reservation_extra(db, reservation_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete(
    "/reservations/{reservation_id}/extras/{extra_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_reservation_extra(
    reservation_id: int,
    extra_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Remove um item extra da reserva."""
    deleted = service.delete_reservation_extra(db, reservation_id, extra_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Extra not found for reservation")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Payments ----

@router.get("/reservations/{reservation_id}/payments", response_model=List[schemas.PaymentResponse])
def list_reservation_payments(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Pagamentos (parcelas) registrados na reserva."""
    return service.get_reservation_payments(db, reservation_id)


@router.post(
    "/reservations/{reservation_id}/payments",
    response_model=schemas.PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    reservation_id: int,
    payload: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Registra um pagamento; atualiza automaticamente o total pago da reserva."""
    try:
        return service.create_payment(db, reservation_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete(
    "/reservations/{reservation_id}/payments/{payment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_payment(
    reservation_id: int,
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Remove um pagamento; atualiza automaticamente o total pago da reserva."""
    deleted = service.delete_payment(db, reservation_id, payment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Payment not found for reservation")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
