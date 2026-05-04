"""Read/write daily prices with optional provider refresh."""

from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.asset import Asset
from app.models.price import DailyPrice
from app.services.market_data_service import fetch_adjusted_prices
from app.services.price_ingestion_service import upsert_asset, upsert_daily_prices


def query_prices_in_range(
    db: Session, asset_id: int, start: date, end: date
) -> list[DailyPrice]:
    stmt = (
        select(DailyPrice)
        .where(
            DailyPrice.asset_id == asset_id,
            DailyPrice.date >= start,
            DailyPrice.date <= end,
        )
        .order_by(DailyPrice.date)
    )
    return list(db.scalars(stmt).all())


def _should_refresh(
    rows: list[DailyPrice], start: date, end: date
) -> bool:
    if not rows:
        return True
    dates = [r.date for r in rows]
    d_min, d_max = min(dates), max(dates)
    if d_min > start or d_max < end:
        return True
    today = date.today()
    target_end = min(end, today)
    stale_cutoff = target_end - timedelta(days=settings.PRICE_STALE_DAYS)
    return d_max < stale_cutoff


def get_or_refresh_prices(
    db: Session,
    symbol: str,
    start: date,
    end: date,
    *,
    force_refresh: bool = False,
) -> tuple[Asset, list[DailyPrice]]:
    """Return asset and daily rows for symbol in range, fetching provider if needed."""
    sym = symbol.upper().strip()
    asset = db.query(Asset).filter(Asset.symbol == sym).one_or_none()
    rows: list[DailyPrice] = []
    if asset:
        rows = query_prices_in_range(db, asset.id, start, end)

    if force_refresh or _should_refresh(rows, start, end):
        df = fetch_adjusted_prices(sym, start, end)
        if not df.empty:
            if asset is None:
                asset = upsert_asset(db, sym)
            upsert_daily_prices(db, asset.id, df)
            db.commit()
            db.refresh(asset)
            rows = query_prices_in_range(db, asset.id, start, end)
        elif asset is None:
            asset = upsert_asset(db, sym)
            db.commit()
            db.refresh(asset)

    if asset is None:
        asset = upsert_asset(db, sym)
        db.commit()
        db.refresh(asset)
        rows = query_prices_in_range(db, asset.id, start, end)

    return asset, rows
