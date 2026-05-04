from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.alert import AlertCreate, AlertEventResponse, AlertResponse
from app.services.alert_service import create_alert, list_alert_events, list_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/events", response_model=list[AlertEventResponse])
def list_alert_events_route(
    limit: int = 50,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[AlertEventResponse]:
    return list_alert_events(db, current.id, limit=limit)


@router.get("/", response_model=list[AlertResponse])
def list_alerts_route(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[AlertResponse]:
    return list_alerts(db, current.id)


@router.post("/", response_model=AlertResponse, status_code=201)
def create_alert_route(
    body: AlertCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AlertResponse:
    try:
        return create_alert(db, current.id, body)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
