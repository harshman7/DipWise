from datetime import date

import pandas as pd
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.price import DailyPrice
from app.services.dip_detection_service import extended_fetch_start
from app.services.indicator_service import (
    add_exponential_moving_averages,
    add_simple_moving_averages,
)
from app.services.price_query_service import get_or_refresh_prices

router = APIRouter(prefix="/prices", tags=["prices"])

_INDICATOR_MAX_PERIOD = 500
_INDICATOR_MIN_PERIOD = 2


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
    ema_100: float | None = Field(
        default=None,
        description="100-day exponential moving average (EWMA span) when requested via ema_periods.",
    )
    sma_by_period: dict[str, float] = Field(
        default_factory=dict,
        description="SMA values keyed by period string (e.g. '50') for each requested sma_period.",
    )
    ema_by_period: dict[str, float] = Field(
        default_factory=dict,
        description="EMA values keyed by period string for each requested ema_period.",
    )

    model_config = {"from_attributes": True}


class PriceListResponse(BaseModel):
    symbol: str
    start: date
    end: date
    prices: list[PriceBar]


def _normalize_indicator_periods(raw: list[int] | None) -> list[int]:
    if not raw:
        return []
    seen: set[int] = set()
    out: list[int] = []
    for p in raw:
        if p < _INDICATOR_MIN_PERIOD or p > _INDICATOR_MAX_PERIOD:
            continue
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out


def _bar_from_daily(
    r: DailyPrice, *, sma_100: float | None = None, ema_100: float | None = None
) -> PriceBar:
    return PriceBar(
        date=r.date,
        open=float(r.open),
        high=float(r.high),
        low=float(r.low),
        close=float(r.close),
        adj_close=float(r.adj_close),
        volume=int(r.volume),
        sma_100=sma_100,
        ema_100=ema_100,
        sma_by_period={},
        ema_by_period={},
    )


def _build_price_list(
    db: Session,
    symbol: str,
    start: date,
    end: date,
    *,
    sma_periods: list[int] | None,
    ema_periods: list[int] | None,
    force_refresh: bool = False,
) -> PriceListResponse:
    sym = symbol.upper().strip()
    sma_p = _normalize_indicator_periods(sma_periods)
    ema_p = _normalize_indicator_periods(ema_periods)
    need_indicators = bool(sma_p or ema_p)

    if not need_indicators:
        _, rows = get_or_refresh_prices(
            db, symbol, start, end, force_refresh=force_refresh
        )
        bars = [_bar_from_daily(r) for r in rows]
        return PriceListResponse(symbol=sym, start=start, end=end, prices=bars)

    all_windows = sma_p + ema_p
    warm_start = extended_fetch_start(start, max(all_windows))
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
    if sma_p:
        df = add_simple_moving_averages(df, sma_p)
    if ema_p:
        df = add_exponential_moving_averages(df, ema_p)
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df[(df["date"] >= start) & (df["date"] <= end)]

    want_sma_100 = 100 in sma_p
    want_ema_100 = 100 in ema_p
    bars: list[PriceBar] = []
    for _, row in df.iterrows():
        sma_100_val: float | None = None
        if want_sma_100 and pd.notna(row.get("sma_100")):
            sma_100_val = round(float(row["sma_100"]), 4)
        ema_100_val: float | None = None
        if want_ema_100 and pd.notna(row.get("ema_100")):
            ema_100_val = round(float(row["ema_100"]), 4)
        sma_by: dict[str, float] = {}
        for p in sma_p:
            col = f"sma_{p}"
            if col in row.index and pd.notna(row.get(col)):
                sma_by[str(p)] = round(float(row[col]), 4)
        ema_by: dict[str, float] = {}
        for p in ema_p:
            col = f"ema_{p}"
            if col in row.index and pd.notna(row.get(col)):
                ema_by[str(p)] = round(float(row[col]), 4)
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
                ema_100=ema_100_val,
                sma_by_period=sma_by,
                ema_by_period=ema_by,
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
        description="SMA lookbacks (e.g. 100). Values appear in sma_by_period and, for period 100 only, sma_100.",
    ),
    ema_periods: list[int] | None = Query(
        None,
        description="EMA spans (e.g. 100). Values appear in ema_by_period and, for period 100 only, ema_100.",
    ),
    db: Session = Depends(get_db),
) -> PriceListResponse:
    """Return historical daily prices for a symbol (DB-backed with provider backfill)."""
    return _build_price_list(
        db,
        symbol,
        start,
        end,
        sma_periods=sma_periods,
        ema_periods=ema_periods,
        force_refresh=False,
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
    ema_periods: list[int] | None = Query(
        None,
        description="EMA spans; combined with sma_periods for warmup window.",
    ),
    db: Session = Depends(get_db),
) -> PriceListResponse:
    """Force re-fetch from market data provider for the date range."""
    return _build_price_list(
        db,
        symbol,
        start,
        end,
        sma_periods=sma_periods,
        ema_periods=ema_periods,
        force_refresh=True,
    )
