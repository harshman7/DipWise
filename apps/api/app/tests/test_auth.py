def test_register_and_login(client):
    r = client.post(
        "/auth/register",
        json={
            "email": "user@example.com",
            "password": "password12",
            "full_name": "Test User",
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "user@example.com"

    r2 = client.post(
        "/auth/register",
        json={"email": "user@example.com", "password": "otherpassword12"},
    )
    assert r2.status_code == 409

    bad = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "wrong"},
    )
    assert bad.status_code == 401

    ok = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "password12"},
    )
    assert ok.status_code == 200
    token = ok.json()["access_token"]
    assert token

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "user@example.com"


def test_protected_routes_require_auth(client):
    for path in ("/portfolios/", "/alerts/", "/watchlists/", "/saved-backtests/"):
        r = client.get(path)
        assert r.status_code in (401, 403), path


def test_portfolio_flow(client):
    client.post(
        "/auth/register",
        json={"email": "p@example.com", "password": "password12"},
    )
    login = client.post(
        "/auth/login",
        json={"email": "p@example.com", "password": "password12"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/portfolios/",
        headers=headers,
        json={"name": "Main", "description": "test"},
    )
    assert created.status_code == 201
    pid = created.json()["id"]

    lst = client.get("/portfolios/", headers=headers)
    assert lst.status_code == 200
    assert len(lst.json()) == 1

    detail = client.get(f"/portfolios/{pid}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["name"] == "Main"
    assert detail.json()["positions"] == []

    buy = client.post(
        f"/portfolios/{pid}/transactions",
        headers=headers,
        json={
            "symbol": "AAPL",
            "tx_type": "buy",
            "shares": 10,
            "price": 150.0,
        },
    )
    assert buy.status_code == 201
    assert buy.json()["asset_symbol"] == "AAPL"

    txs = client.get(f"/portfolios/{pid}/transactions", headers=headers)
    assert txs.status_code == 200
    assert len(txs.json()) == 1

    detail2 = client.get(f"/portfolios/{pid}", headers=headers)
    assert detail2.status_code == 200
    pos = detail2.json()["positions"]
    assert len(pos) == 1
    assert pos[0]["asset_symbol"] == "AAPL"
    assert pos[0]["shares"] == 10.0
    assert pos[0]["avg_cost_basis"] == 150.0

    sell = client.post(
        f"/portfolios/{pid}/transactions",
        headers=headers,
        json={
            "symbol": "AAPL",
            "tx_type": "sell",
            "shares": 4,
            "price": 160.0,
        },
    )
    assert sell.status_code == 201

    detail3 = client.get(f"/portfolios/{pid}", headers=headers)
    pos2 = detail3.json()["positions"]
    assert len(pos2) == 1
    assert pos2[0]["shares"] == 6.0
    assert pos2[0]["avg_cost_basis"] == 150.0

    oversell = client.post(
        f"/portfolios/{pid}/transactions",
        headers=headers,
        json={
            "symbol": "AAPL",
            "tx_type": "sell",
            "shares": 100,
            "price": 160.0,
        },
    )
    assert oversell.status_code == 400

    close = client.post(
        f"/portfolios/{pid}/transactions",
        headers=headers,
        json={
            "symbol": "AAPL",
            "tx_type": "sell",
            "shares": 6,
            "price": 155.0,
        },
    )
    assert close.status_code == 201
    flat = client.get(f"/portfolios/{pid}", headers=headers)
    assert flat.json()["positions"] == []


def test_portfolio_transactions_other_user_404(client):
    client.post(
        "/auth/register",
        json={"email": "a1@example.com", "password": "password12"},
    )
    client.post(
        "/auth/register",
        json={"email": "a2@example.com", "password": "password12"},
    )
    login1 = client.post(
        "/auth/login",
        json={"email": "a1@example.com", "password": "password12"},
    )
    login2 = client.post(
        "/auth/login",
        json={"email": "a2@example.com", "password": "password12"},
    )
    h1 = {"Authorization": f"Bearer {login1.json()['access_token']}"}
    h2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    pid = client.post(
        "/portfolios/", headers=h1, json={"name": "Mine"}
    ).json()["id"]

    r = client.get(f"/portfolios/{pid}/transactions", headers=h2)
    assert r.status_code == 404

    r2 = client.post(
        f"/portfolios/{pid}/transactions",
        headers=h2,
        json={
            "symbol": "MSFT",
            "tx_type": "buy",
            "shares": 1,
            "price": 100.0,
        },
    )
    assert r2.status_code == 404
