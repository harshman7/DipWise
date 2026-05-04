"""Alert checking and notification logic.

Placeholder — will check live prices against user thresholds and trigger events.
"""

from sqlalchemy.orm import Session

from app.models.alert import Alert


def check_alerts(db: Session) -> int:
    """Check all active alerts against current prices. Returns count of triggered alerts."""
    _active = db.query(Alert).filter(Alert.is_active.is_(True)).all()
    # TODO: fetch current prices and compare against thresholds
    triggered = 0
    return triggered
