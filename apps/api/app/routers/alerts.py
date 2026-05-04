from fastapi import APIRouter, HTTPException, status

from app.schemas.alert import AlertCreate, AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertResponse])
def list_alerts() -> list[AlertResponse]:
    """List alerts for the authenticated user."""
    # TODO: wire auth dependency
    return []


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(body: AlertCreate) -> AlertResponse:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not yet implemented")
