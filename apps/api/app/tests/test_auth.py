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
    for path in ("/portfolios/", "/alerts/", "/watchlists/"):
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
