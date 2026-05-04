from sqlalchemy.orm import Session

from app.models.backtest import SavedBacktest
from app.schemas.backtest import SavedBacktestCreate, SavedBacktestResponse


def list_saved_backtests(db: Session, user_id: int) -> list[SavedBacktestResponse]:
    rows = (
        db.query(SavedBacktest)
        .filter(SavedBacktest.user_id == user_id)
        .order_by(SavedBacktest.created_at.desc())
        .all()
    )
    return [SavedBacktestResponse.model_validate(r) for r in rows]


def get_saved_backtest(
    db: Session, user_id: int, backtest_id: int
) -> SavedBacktestResponse | None:
    row = (
        db.query(SavedBacktest)
        .filter(SavedBacktest.id == backtest_id, SavedBacktest.user_id == user_id)
        .one_or_none()
    )
    if not row:
        return None
    return SavedBacktestResponse.model_validate(row)


def create_saved_backtest(
    db: Session, user_id: int, body: SavedBacktestCreate
) -> SavedBacktestResponse:
    sym = body.symbol.upper().strip()
    row = SavedBacktest(
        user_id=user_id,
        symbol=sym,
        parameters=body.parameters,
        results=body.results,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return SavedBacktestResponse.model_validate(row)
