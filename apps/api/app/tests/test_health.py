from datetime import date, timedelta

import pandas as pd
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "dipwise-api"


def _synthetic_prices():
    d0 = date(2020, 1, 1)
    rows = []
    for i in range(400):
        d = d0 + timedelta(days=i)
        px = 100.0 + float(i) * 0.05
        if i in (150, 151, 152):
            px = 70.0
        rows.append(
            {
                "date": d,
                "open": px,
                "high": px + 1,
                "low": px - 1,
                "close": px,
                "adj_close": px,
                "volume": 1_000_000,
            }
        )
    return pd.DataFrame(rows)


def test_analysis_dips_with_mock_prices(monkeypatch):
    def fake_fetch(symbol, start, end):
        return _synthetic_prices()

    monkeypatch.setattr(
        "app.services.backtest_service.fetch_adjusted_prices",
        fake_fetch,
    )
    payload = {
        "symbol": "VOO",
        "start_date": "2021-01-01",
        "end_date": "2021-06-01",
        "dip_threshold": 0.05,
        "investment_amount": 200,
        "lookback_days": 30,
        "holding_period_days": [5, 30],
    }
    response = client.post("/analysis/dips", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "VOO"
    assert data["total_dips_detected"] >= 0
    assert len(data["dip_events"]) == data["total_dips_detected"]
