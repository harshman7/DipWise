from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "dipwise-api"


def test_analysis_dips_returns_mock_data():
    payload = {
        "symbol": "VOO",
        "start_date": "2021-01-01",
        "end_date": "2026-01-01",
        "dip_threshold": 0.05,
        "investment_amount": 200,
        "lookback_days": 90,
        "holding_period_days": [30, 90, 365, 730],
    }
    response = client.post("/analysis/dips", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "VOO"
    assert data["total_dips_detected"] > 0
    assert len(data["dip_events"]) == data["total_dips_detected"]
