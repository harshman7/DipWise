from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.backtest import SavedBacktestCreate, SavedBacktestResponse
from app.services.saved_backtest_service import (
    create_saved_backtest,
    get_saved_backtest,
    list_saved_backtests,
)

router = APIRouter(prefix="/saved-backtests", tags=["saved-backtests"])


@router.get("/", response_model=list[SavedBacktestResponse])
def list_saved_backtests_route(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[SavedBacktestResponse]:
    return list_saved_backtests(db, current.id)


@router.post("/", response_model=SavedBacktestResponse, status_code=201)
def create_saved_backtest_route(
    body: SavedBacktestCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> SavedBacktestResponse:
    return create_saved_backtest(db, current.id, body)


@router.get("/{backtest_id}", response_model=SavedBacktestResponse)
def get_saved_backtest_route(
    backtest_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> SavedBacktestResponse:
    row = get_saved_backtest(db, current.id, backtest_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved backtest not found",
        )
    return row
