from datetime import date

import pandas as pd
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.price import DailyPrice
from app.services.dip_detection_service import extended_fetch_start
from app.services.indicator_service import add_simple_moving_averages
from app.services.price_query_service import get_or_refresh_prices

router = APIRouter(prefix="/prices", tags=["prices"])

_SMA_MAX_PERIOD = 500
_SMA_MIN_PERIOD = 2


class PriceBar(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    adj_close: float
    volume: int
    sma_100: float | None = Field(
        default=None,
        description="100-day simple moving average of adj_close when requested via sma_periods.",
    )

    model_config = {"from_attributes": True}


class PriceListResponse(BaseModel):
    symbol: str
    start: date
    end: date
    prices: list[PriceBar]


def _normalize_sma_periods(raw: list[int] | None) -> list[int]:
    if not raw:
        return []
    seen: set[int] = set()
    out: list[int] = []
    for p in raw:
        if p < _SMA_MIN_PERIOD or p > _SMA_MAX_PERIOD:
            continue
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out


def _bar_from_daily(r: DailyPrice, *, sma_100: float | None = None) -> PriceBar:
    return PriceBar(
        date=r.date,
        open=float(r.open),
        high=float(r.high),
        low=float(r.low),
        close=float(r.close),
        adj_close=float(r.adj_close),
        volume=int(r.volume),
        sma_100=sma_100,
    )


def _build_price_list(
    db: Session,
    symbol: str,
    start: date,
    end: date,
    *,
    sma_periods: list[int] | None,
    force_refresh: bool = False,
) -> PriceListResponse:
    sym = symbol.upper().strip()
    periods = _normalize_sma_periods(sma_periods)

    if not periods:
        _, rows = get_or_refresh_prices(
            db, symbol, start, end, force_refresh=force_refresh
        )
        bars = [_bar_from_daily(r) for r in rows]
        return PriceListResponse(symbol=sym, start=start, end=end, prices=bars)

    warm_start = extended_fetch_start(start, max(periods))
    _, rows = get_or_refresh_prices(
        db, symbol, warm_start, end, force_refresh=force_refresh
    )
    if not rows:
        return PriceListResponse(symbol=sym, start=start, end=end, prices=[])

    df = pd.DataFrame(
        [
            {
                "date": r.date,
                "open": float(r.open),
                "high": float(r.high),
                "low": float(r.low),
                "close": float(r.close),
                "adj_close": float(r.adj_close),
                "volume": int(r.volume),
            }
            for r in rows
        ]
    )
    df = add_simple_moving_averages(df, periods)
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df[(df["date"] >= start) & (df["date"] <= end)]

    want_sma_100 = 100 in periods
    bars: list[PriceBar] = []
    for _, row in df.iterrows():
        sma_100_val: float | None = None
        if want_sma_100 and pd.notna(row.get("sma_100")):
            sma_100_val = round(float(row["sma_100"]), 4)
        bars.append(
            PriceBar(
                date=row["date"],
                open=float(row["open"]),
                high=float(row["high"]),
                low=float(row["low"]),
                close=float(row["close"]),
                adj_close=float(row["adj_close"]),
                volume=int(row["volume"]),
                sma_100=sma_100_val,
            )
        )

    return PriceListResponse(symbol=sym, start=start, end=end, prices=bars)


@router.get("/{symbol}", response_model=PriceListResponse)
def get_prices(
    symbol: str,
    start: date = Query(...),
    end: date = Query(...),
    sma_periods: list[int] | None = Query(
        None,
        description="SMA lookbacks to include (e.g. repeat query param or use 100). Only sma_100 is returned for period 100.",
    ),
    db: Session = Depends(get_db),
) -> PriceListResponse:
    """Return historical daily prices for a symbol (DB-backed with provider backfill)."""
    return _build_price_list(
        db, symbol, start, end, sma_periods=sma_periods, force_refresh=False
    )


@router.post("/{symbol}/refresh", response_model=PriceListResponse)
def refresh_prices(
    symbol: str,
    start: date = Query(...),
    end: date = Query(...),
    sma_periods: list[int] | None = Query(
        None,
        description="SMA lookbacks; warms up history before start when set.",
    ),
    db: Session = Depends(get_db),
) -> PriceListResponse:
    """Force re-fetch from market data provider for the date range."""
    return _build_price_list(
        db, symbol, start, end, sma_periods=sma_periods, force_refresh=True
    )
