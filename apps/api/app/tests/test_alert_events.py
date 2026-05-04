from app.models.alert import AlertEvent


def test_alert_events_require_auth(client):
    r = client.get("/alerts/events")
    assert r.status_code in (401, 403)


def test_list_alert_events_for_user(client, db_session):
    client.post(
        "/auth/register",
        json={"email": "ev@example.com", "password": "password12"},
    )
    login = client.post(
        "/auth/login",
        json={"email": "ev@example.com", "password": "password12"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    created = client.post(
        "/alerts/",
        headers=headers,
        json={
            "symbol": "SPY",
            "alert_type": "price_below",
            "threshold": 400.0,
        },
    )
    assert created.status_code == 201
    alert_id = created.json()["id"]

    empty = client.get("/alerts/events", headers=headers)
    assert empty.status_code == 200
    assert empty.json() == []

    db_session.add(
        AlertEvent(
            alert_id=alert_id,
            price_at_trigger=399.5,
            details="Test fire",
        )
    )
    db_session.commit()

    listed = client.get("/alerts/events", headers=headers)
    assert listed.status_code == 200
    body = listed.json()
    assert len(body) == 1
    assert body[0]["alert_id"] == alert_id
    assert body[0]["asset_symbol"] == "SPY"
    assert body[0]["alert_type"] == "price_below"
    assert body[0]["details"] == "Test fire"
