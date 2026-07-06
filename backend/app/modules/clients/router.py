"""Clients module - FastAPI routes."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.models import User

from . import schemas, service

router = APIRouter(tags=["Clients"])


# ---- Clients ----
@router.get("/clients", response_model=List[schemas.ClientResponse])
def list_clients(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return service.list_clients(db, search)


@router.post("/clients", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client: schemas.ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return service.create_client(db, client)


@router.get("/clients/{client_id}", response_model=schemas.ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    client = service.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/clients/{client_id}", response_model=schemas.ClientResponse)
def update_client(
    client_id: int,
    client: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    updated = service.update_client(db, client_id, client)
    if not updated:
        raise HTTPException(status_code=404, detail="Client not found")
    return updated


@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.delete_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Persons ----
@router.get("/clients/{client_id}/persons", response_model=List[schemas.PersonResponse])
def list_persons(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.get_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    return service.get_client_persons(db, client_id)


@router.post(
    "/clients/{client_id}/persons",
    response_model=schemas.PersonResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_person(
    client_id: int,
    person: schemas.PersonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.get_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    return service.create_person(db, client_id, person)


@router.put("/clients/{client_id}/persons/{person_id}", response_model=schemas.PersonResponse)
def update_person(
    client_id: int,
    person_id: int,
    person: schemas.PersonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    updated = service.update_person(db, client_id, person_id, person)
    if not updated:
        raise HTTPException(status_code=404, detail="Person not found for client")
    return updated


@router.delete(
    "/clients/{client_id}/persons/{person_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_person(
    client_id: int,
    person_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.delete_person(db, client_id, person_id):
        raise HTTPException(status_code=404, detail="Person not found for client")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---- Participação por evento ----
@router.get("/clients/{client_id}/events", response_model=List[schemas.ClientEventLink])
def list_client_events(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.get_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    return service.get_client_events(db, client_id)


# ---- Conta corrente (extrato) ----
@router.get("/clients/{client_id}/statement", response_model=schemas.ClientStatementResponse)
def get_client_statement(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    statement = service.get_client_statement(db, client_id)
    if statement is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return statement


@router.post(
    "/clients/{client_id}/ledger-entries",
    response_model=schemas.LedgerEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ledger_entry(
    client_id: int,
    entry: schemas.LedgerEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.get_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    return service.create_ledger_entry(db, client_id, entry)


@router.delete(
    "/clients/{client_id}/ledger-entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_ledger_entry(
    client_id: int,
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not service.delete_ledger_entry(db, client_id, entry_id):
        raise HTTPException(status_code=404, detail="Ledger entry not found for client")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/clients/from-group/{group_id}",
    response_model=schemas.ClientResponse,
    status_code=status.HTTP_201_CREATED,
)
def promote_group_to_client(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        return service.promote_group_to_client(db, group_id)
    except ValueError as exc:
        detail = str(exc)
        code = 404 if detail == "Group not found" else 400
        raise HTTPException(status_code=code, detail=detail) from exc


@router.post(
    "/clients/{client_id}/import-to-event/{event_id}",
    response_model=schemas.ImportClientToEventResult,
    status_code=status.HTTP_201_CREATED,
)
def import_client_to_event(
    client_id: int,
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        result = service.import_client_to_event(db, client_id, event_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not result:
        raise HTTPException(status_code=404, detail="Client not found")
    return result
