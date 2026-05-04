import logging
from datetime import date, timedelta

from app.core.database import SessionLocal
from app.models.alert import Alert
from app.models.asset import Asset
from app.models.portfolio import WatchlistItem
from app.services.alert_service import check_alerts
from app.services.market_data_service import fetch_adjusted_prices
from app.services.price_ingestion_service import upsert_asset, upsert_daily_prices
from app.workers.celery_app import celery

logger = logging.getLogger(__name__)


@celery.task(name="app.workers.tasks.ping")
def ping() -> str:
    return "pong"


@celery.task(name="app.workers.tasks.ingest_active_symbols")
def ingest_active_symbols() -> int:
    """Fetch recent daily prices for symbols referenced by alerts/watchlists + SPY."""
    db = SessionLocal()
    symbols: set[str] = set()
    try:
        q1 = (
            db.query(Asset.symbol)
            .join(Alert, Alert.asset_id == Asset.id)
            .filter(Alert.is_active.is_(True))
            .distinct()
        )
        symbols.update(s for (s,) in q1.all() if s)
        q2 = (
            db.query(Asset.symbol)
            .join(WatchlistItem, WatchlistItem.asset_id == Asset.id)
            .distinct()
        )
        symbols.update(s for (s,) in q2.all() if s)
        symbols.add("SPY")

        end = date.today()
        start = end - timedelta(days=120)
        processed = 0
        for sym in sorted(symbols):
            try:
                df = fetch_adjusted_prices(sym, start, end)
                if df.empty:
                    continue
                asset = upsert_asset(db, sym)
                upsert_daily_prices(db, asset.id, df)
                db.commit()
                processed += 1
            except Exception:
                logger.exception("ingest failed for %s", sym)
                db.rollback()
        return processed
    finally:
        db.close()


@celery.task(name="app.workers.tasks.run_check_alerts")
def run_check_alerts() -> int:
    db = SessionLocal()
    try:
        return check_alerts(db)
    except Exception:
        logger.exception("check_alerts failed")
        db.rollback()
        return 0
    finally:
        db.close()
