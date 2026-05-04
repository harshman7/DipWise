from fastapi import APIRouter, HTTPException, status

from app.schemas.alert import AlertCreate, AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertResponse])
def list_alerts_route() -> list[AlertResponse]:
    """List alerts for the authenticated user."""
    return []


@router.post("/", response_model=AlertResponse, status_code=201)
def create_alert_route(body: AlertCreate) -> AlertResponse:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not yet implemented",
    )
