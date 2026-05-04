from datetime import date

from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.price_query_service import get_or_refresh_prices

router = APIRouter(prefix="/prices", tags=["prices"])


class PriceBar(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    adj_close: float
    volume: int

    model_config = {"from_attributes": True}


class PriceListResponse(BaseModel):
    symbol: str
    start: date
    end: date
    prices: list[PriceBar]


@router.get("/{symbol}", response_model=PriceListResponse)
def get_prices(
    symbol: str,
    start: date = Query(...),
    end: date = Query(...),
    db: Session = Depends(get_db),
) -> PriceListResponse:
    """Return historical daily prices for a symbol (DB-backed with provider backfill)."""
    asset, rows = get_or_refresh_prices(db, symbol, start, end)
    sym = symbol.upper().strip()
    bars = [
        PriceBar(
            date=r.date,
            open=float(r.open),
            high=float(r.high),
            low=float(r.low),
            close=float(r.close),
            adj_close=float(r.adj_close),
            volume=int(r.volume),
        )
        for r in rows
    ]
    return PriceListResponse(symbol=sym, start=start, end=end, prices=bars)


@router.post("/{symbol}/refresh", response_model=PriceListResponse)
def refresh_prices(
    symbol: str,
    start: date = Query(...),
    end: date = Query(...),
    db: Session = Depends(get_db),
) -> PriceListResponse:
    """Force re-fetch from market data provider for the date range."""
    asset, rows = get_or_refresh_prices(
        db, symbol, start, end, force_refresh=True
    )
    sym = symbol.upper().strip()
    bars = [
        PriceBar(
            date=r.date,
            open=float(r.open),
            high=float(r.high),
            low=float(r.low),
            close=float(r.close),
            adj_close=float(r.adj_close),
            volume=int(r.volume),
        )
        for r in rows
    ]
    return PriceListResponse(symbol=sym, start=start, end=end, prices=bars)
