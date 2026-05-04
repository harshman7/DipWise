def test_saved_backtests_require_auth(client):
    r = client.get("/saved-backtests/")
    assert r.status_code in (401, 403)
    r2 = client.post(
        "/saved-backtests/",
        json={"symbol": "VOO", "parameters": {}, "results": {}},
    )
    assert r2.status_code in (401, 403)


def test_saved_backtest_crud(client):
    client.post(
        "/auth/register",
        json={"email": "bt@example.com", "password": "password12"},
    )
    login = client.post(
        "/auth/login",
        json={"email": "bt@example.com", "password": "password12"},
    )
    h = {"Authorization": f"Bearer {login.json()['access_token']}"}

    empty = client.get("/saved-backtests/", headers=h)
    assert empty.status_code == 200
    assert empty.json() == []

    created = client.post(
        "/saved-backtests/",
        headers=h,
        json={
            "symbol": "qqq",
            "parameters": {"lookback_days": 90},
            "results": {"total_dips_detected": 3},
        },
    )
    assert created.status_code == 201
    bid = created.json()["id"]
    assert created.json()["symbol"] == "QQQ"

    lst = client.get("/saved-backtests/", headers=h)
    assert len(lst.json()) == 1

    one = client.get(f"/saved-backtests/{bid}", headers=h)
    assert one.status_code == 200
    assert one.json()["results"]["total_dips_detected"] == 3

    missing = client.get("/saved-backtests/99999", headers=h)
    assert missing.status_code == 404
