"""Persist assets and daily prices to PostgreSQL."""

from datetime import date

import pandas as pd
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.price import DailyPrice


def upsert_asset(
    db: Session,
    symbol: str,
    name: str | None = None,
    asset_type: str = "stock",
    exchange: str | None = None,
) -> Asset:
    sym = symbol.upper().strip()
    row = db.query(Asset).filter(Asset.symbol == sym).one_or_none()
    if row:
        if name:
            row.name = name
        return row
    asset = Asset(
        symbol=sym,
        name=name or sym,
        asset_type=asset_type,
        exchange=exchange,
    )
    db.add(asset)
    db.flush()
    return asset


def upsert_daily_prices(db: Session, asset_id: int, df: pd.DataFrame) -> int:
    """Replace daily rows for the date range in df. Returns rows inserted."""
    if df.empty:
        return 0
    dmin = min(df["date"])
    dmax = max(df["date"])
    db.execute(
        delete(DailyPrice).where(
            DailyPrice.asset_id == asset_id,
            DailyPrice.date >= dmin,
            DailyPrice.date <= dmax,
        )
    )
    count = 0
    for _, r in df.iterrows():
        db.add(
            DailyPrice(
                asset_id=asset_id,
                date=r["date"],
                open=float(r["open"]),
                high=float(r["high"]),
                low=float(r["low"]),
                close=float(r["close"]),
                adj_close=float(r["adj_close"]),
                volume=int(r["volume"]) if pd.notna(r["volume"]) else 0,
            )
        )
        count += 1
    return count


def ingest_symbol_range(
    db: Session, symbol: str, start: date, end: date, df: pd.DataFrame
) -> Asset:
    """Ensure asset exists and replace prices in df's range."""
    asset = upsert_asset(db, symbol)
    upsert_daily_prices(db, asset.id, df)
    db.commit()
    db.refresh(asset)
    return asset
