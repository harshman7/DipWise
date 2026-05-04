"""Alert checking and notification logic."""

from datetime import date

import pandas as pd
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.alert import Alert, AlertEvent
from app.models.price import DailyPrice
from app.schemas.alert import AlertCreate, AlertEventResponse, AlertResponse
from app.services.price_ingestion_service import upsert_asset


DEFAULT_LOOKBACK = 90


def _sma_cross_triggered(
    closes: list[float], period: int, direction: str
) -> bool:
    if len(closes) < period + 1:
        return False
    s = pd.Series(closes, dtype=float)
    sma = s.rolling(window=period, min_periods=period).mean()
    prev_close, curr_close = closes[-2], closes[-1]
    prev_sma, curr_sma = float(sma.iloc[-2]), float(sma.iloc[-1])
    if pd.isna(prev_sma) or pd.isna(curr_sma):
        return False
    if direction == "below":
        return prev_close >= prev_sma and curr_close < curr_sma
    return prev_close <= prev_sma and curr_close > curr_sma


def list_alerts(db: Session, user_id: int) -> list[AlertResponse]:
    rows = (
        db.query(Alert)
        .filter(Alert.user_id == user_id)
        .order_by(Alert.created_at.desc())
        .all()
    )
    return [AlertResponse.model_validate(r) for r in rows]


def list_alert_events(
    db: Session, user_id: int, *, limit: int = 50
) -> list[AlertEventResponse]:
    limit = min(max(limit, 1), 200)
    rows = (
        db.query(AlertEvent, Alert, Asset.symbol)
        .join(Alert, Alert.id == AlertEvent.alert_id)
        .join(Asset, Asset.id == Alert.asset_id)
        .filter(Alert.user_id == user_id)
        .order_by(AlertEvent.triggered_at.desc())
        .limit(limit)
        .all()
    )
    return [
        AlertEventResponse(
            id=evt.id,
            alert_id=evt.alert_id,
            triggered_at=evt.triggered_at,
            price_at_trigger=float(evt.price_at_trigger),
            details=evt.details,
            alert_type=alert.alert_type,
            asset_id=alert.asset_id,
            asset_symbol=symbol,
        )
        for evt, alert, symbol in rows
    ]


def create_alert(db: Session, user_id: int, body: AlertCreate) -> AlertResponse:
    if body.symbol and str(body.symbol).strip():
        a = upsert_asset(db, body.symbol)
        db.flush()
        asset_id = a.id
    elif body.asset_id is not None:
        exists = db.query(Asset).filter(Asset.id == body.asset_id).first()
        if not exists:
            raise ValueError("Unknown asset_id")
        asset_id = body.asset_id
    else:
        raise ValueError("Provide asset_id or symbol")
    alert = Alert(
        user_id=user_id,
        asset_id=asset_id,
        alert_type=body.alert_type,
        threshold=body.threshold,
        message=body.message,
        params_json=body.params_json,
        is_active=True,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return AlertResponse.model_validate(alert)


def check_alerts(db: Session) -> int:
    """Check active alerts against recent prices in DB. Returns events created."""
    alerts: list[Alert] = db.query(Alert).filter(Alert.is_active.is_(True)).all()
    triggered = 0
    today = date.today()

    for alert in alerts:
        price_rows = (
            db.query(DailyPrice)
            .filter(DailyPrice.asset_id == alert.asset_id)
            .order_by(DailyPrice.date.desc())
            .limit(500)
            .all()
        )
        if len(price_rows) < 2:
            continue
        price_rows = list(reversed(price_rows))

        closes = [float(r.adj_close) for r in price_rows]
        latest_close = closes[-1]
        latest_date = price_rows[-1].date

        should_fire = False
        thr = float(alert.threshold)

        if alert.alert_type == "sma_cross":
            params = alert.params_json or {}
            if params.get("kind") != "sma_cross":
                continue
            period = int(params.get("period", 100))
            direction = str(params.get("direction", "below"))
            should_fire = _sma_cross_triggered(closes, period, direction)
        elif alert.alert_type == "price_below":
            should_fire = latest_close <= thr
        else:
            window = min(DEFAULT_LOOKBACK, len(closes))
            rolling_high = max(closes[-window:])
            if rolling_high > 0:
                dd = (rolling_high - latest_close) / rolling_high
                should_fire = dd >= thr

        if not should_fire:
            continue

        existing = (
            db.query(AlertEvent)
            .filter(AlertEvent.alert_id == alert.id)
            .filter(func.date(AlertEvent.triggered_at) == today)
            .first()
        )
        if existing:
            continue

        evt = AlertEvent(
            alert_id=alert.id,
            price_at_trigger=latest_close,
            details=f"Close {latest_close} on {latest_date}; asset_id={alert.asset_id}",
        )
        db.add(evt)
        triggered += 1

    db.commit()
    return triggered
