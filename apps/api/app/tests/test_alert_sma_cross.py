from datetime import date, timedelta

from app.models.alert import Alert
from app.models.asset import Asset
from app.models.price import DailyPrice
from app.models.user import User
from app.services.alert_service import check_alerts


def _seed_user_asset_prices(db_session, closes: list[float], d0: date | None = None):
    u = User(
        email="a@example.com",
        hashed_password="x",
        full_name=None,
    )
    db_session.add(u)
    db_session.flush()
    a = Asset(
        symbol="CRS",
        name="Cross Test",
        asset_type="etf",
        exchange=None,
        metadata_json=None,
    )
    db_session.add(a)
    db_session.flush()
    start = d0 or date(2024, 1, 1)
    for i, px in enumerate(closes):
        db_session.add(
            DailyPrice(
                asset_id=a.id,
                date=start + timedelta(days=i),
                open=px,
                high=px + 0.1,
                low=px - 0.1,
                close=px,
                adj_close=px,
                volume=1_000_000,
            )
        )
    db_session.commit()
    return u.id, a.id


def test_sma_cross_below_triggers_event(db_session):
    # SMA(3): last bar drops below SMA while prior close was at/above prior SMA
    closes = [100.0, 101.0, 102.0, 103.0, 104.0, 90.0]
    uid, aid = _seed_user_asset_prices(db_session, closes)
    db_session.add(
        Alert(
            user_id=uid,
            asset_id=aid,
            alert_type="sma_cross",
            threshold=0.0,
            message=None,
            params_json={
                "kind": "sma_cross",
                "period": 3,
                "direction": "below",
            },
            is_active=True,
        )
    )
    db_session.commit()
    n = check_alerts(db_session)
    assert n == 1


def test_sma_cross_below_no_trigger_when_above(db_session):
    closes = [100.0, 101.0, 102.0, 103.0, 104.0, 104.0]
    uid, aid = _seed_user_asset_prices(db_session, closes)
    db_session.add(
        Alert(
            user_id=uid,
            asset_id=aid,
            alert_type="sma_cross",
            threshold=0.0,
            message=None,
            params_json={
                "kind": "sma_cross",
                "period": 3,
                "direction": "below",
            },
            is_active=True,
        )
    )
    db_session.commit()
    n = check_alerts(db_session)
    assert n == 0


def test_sma_cross_above_triggers(db_session):
    closes = [104.0, 103.0, 102.0, 101.0, 100.0, 110.0]
    uid, aid = _seed_user_asset_prices(db_session, closes)
    db_session.add(
        Alert(
            user_id=uid,
            asset_id=aid,
            alert_type="sma_cross",
            threshold=0.0,
            message=None,
            params_json={
                "kind": "sma_cross",
                "period": 3,
                "direction": "above",
            },
            is_active=True,
        )
    )
    db_session.commit()
    n = check_alerts(db_session)
    assert n == 1
