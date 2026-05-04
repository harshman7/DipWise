from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.alert import AlertCreate, AlertResponse
from app.services.alert_service import create_alert, list_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertResponse])
def list_alerts_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AlertResponse]:
    """List alerts for the authenticated user."""
    return list_alerts(db, current_user.id)


@router.post("/", response_model=AlertResponse, status_code=201)
def create_alert_route(
    body: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AlertResponse:
    return create_alert(db, current_user.id, body)
