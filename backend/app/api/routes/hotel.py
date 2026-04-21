from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_hotels():
    return []

@router.post("/")
def create_hotel():
    return {"message": "created"}