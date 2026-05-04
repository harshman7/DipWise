from datetime import date, timedelta

import pandas as pd
import pytest

from app.models.asset import Asset
from app.models.price import DailyPrice


def _seed_daily_prices(
    db_session, symbol: str = "TST", *, d0: date | None = None, n_days: int = 250
) -> None:
    a = Asset(
        symbol=symbol,
        name="Test",
        asset_type="etf",
        exchange=None,
        metadata_json=None,
    )
    db_session.add(a)
    db_session.flush()
    start = d0 or date(2024, 1, 1)
    for i in range(n_days):
        px = 100.0 + float(i) * 0.1
        db_session.add(
            DailyPrice(
                asset_id=a.id,
                date=start + timedelta(days=i),
                open=px,
                high=px + 0.5,
                low=px - 0.5,
                close=px,
                adj_close=px,
                volume=1_000_000,
            )
        )
    db_session.commit()


@pytest.fixture
def no_provider(monkeypatch):
    def _empty_df(symbol, start, end):
        return pd.DataFrame()

    monkeypatch.setattr(
        "app.services.price_query_service.fetch_adjusted_prices",
        _empty_df,
    )


def test_get_prices_includes_sma_100_with_warmup(client, db_session, no_provider):
    # Warmup before 2024-06-01 needs ~400+ calendar days of history in DB.
    _seed_daily_prices(db_session, d0=date(2023, 1, 1), n_days=800)
    response = client.get(
        "/prices/TST",
        params=[
            ("start", "2024-06-01"),
            ("end", "2024-08-01"),
            ("sma_periods", "100"),
        ],
    )
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "TST"
    assert len(data["prices"]) >= 30
    first = data["prices"][0]
    assert first["date"] >= "2024-06-01"
    assert first["sma_100"] is not None
    assert first["sma_by_period"].get("100") == first["sma_100"]
    assert abs(first["adj_close"] - first["sma_100"]) < 50


def test_get_prices_includes_ema_100_with_warmup(client, db_session, no_provider):
    _seed_daily_prices(db_session, "EMX", d0=date(2023, 1, 1), n_days=800)
    response = client.get(
        "/prices/EMX",
        params=[
            ("start", "2024-06-01"),
            ("end", "2024-08-01"),
            ("ema_periods", "100"),
        ],
    )
    assert response.status_code == 200
    data = response.json()
    first = data["prices"][0]
    assert first["ema_100"] is not None
    assert first["ema_by_period"].get("100") == first["ema_100"]
    assert first.get("sma_100") is None


def test_get_prices_sma_and_ema_combined(client, db_session, no_provider):
    _seed_daily_prices(db_session, "BOTH", d0=date(2023, 1, 1), n_days=800)
    response = client.get(
        "/prices/BOTH",
        params=[
            ("start", "2024-07-01"),
            ("end", "2024-07-15"),
            ("sma_periods", "100"),
            ("ema_periods", "100"),
        ],
    )
    assert response.status_code == 200
    row = response.json()["prices"][0]
    assert row["sma_100"] is not None
    assert row["ema_100"] is not None
    assert row["sma_by_period"]["100"] == row["sma_100"]
    assert row["ema_by_period"]["100"] == row["ema_100"]


def test_get_prices_without_sma_periods_omits_series(client, db_session, no_provider):
    _seed_daily_prices(db_session, "ABC")
    response = client.get(
        "/prices/ABC",
        params=[("start", "2024-06-01"), ("end", "2024-06-15")],
    )
    assert response.status_code == 200
    row = response.json()["prices"][0]
    assert row.get("sma_100") is None
    assert row.get("sma_by_period") in (None, {})


def test_get_prices_arbitrary_sma_period_in_map(client, db_session, no_provider):
    _seed_daily_prices(db_session, "MAP50", d0=date(2023, 1, 1), n_days=800)
    response = client.get(
        "/prices/MAP50",
        params=[
            ("start", "2024-06-01"),
            ("end", "2024-08-01"),
            ("sma_periods", "50"),
        ],
    )
    assert response.status_code == 200
    row = response.json()["prices"][0]
    assert row.get("sma_100") is None
    assert row["sma_by_period"].get("50") is not None
