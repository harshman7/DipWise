# API Reference

Base URL: `http://localhost:8000`

Interactive docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

Use `Authorization: Bearer <access_token>` for protected routes. In Swagger, use **Authorize** with the token from `POST /auth/token` (form: username = email, password).

## Health

### GET /health

Returns service status.

**Response:**

```json
{ "status": "ok", "service": "dipwise-api" }
```

## Auth

### POST /auth/register

Register and receive a JWT.

**Body:**

```json
{ "email": "user@example.com", "password": "secret", "full_name": "Jane Doe" }
```

### POST /auth/login

JSON login.

**Body:**

```json
{ "email": "user@example.com", "password": "secret" }
```

### POST /auth/token

OAuth2 password flow (`username` = email). Used by Swagger Authorize.

### GET /auth/me

Current user (requires Bearer).

## Assets

### GET /assets/

List all tracked assets. *(Returns empty list until data is seeded)*

### GET /assets/{symbol}

Get a single asset by ticker symbol.

## Prices

### GET /prices/{symbol}?start=YYYY-MM-DD&end=YYYY-MM-DD

Historical daily bars from `daily_prices`, backfilled from the configured market provider when missing or stale (`PRICE_STALE_DAYS`).

### POST /prices/{symbol}/refresh?start=...&end=...

Force provider fetch for the range and upsert DB.

## Analysis

### POST /analysis/dips

Detect dips (rolling high vs adjusted close) and backtest buy-the-dip vs equal daily DCA over the same calendar window (same total capital as dip purchases).

**Body:**

```json
{
  "symbol": "VOO",
  "start_date": "2021-01-01",
  "end_date": "2026-01-01",
  "dip_threshold": 0.05,
  "investment_amount": 200,
  "lookback_days": 90,
  "holding_period_days": [30, 90, 365, 730]
}
```

**Response:** `DipAnalysisResponse` with metrics, per-holding-period summaries, and `dip_events` (forward returns use **trading** rows ahead, not calendar days).

## Portfolios

### GET /portfolios/

List portfolios for the authenticated user.

### GET /portfolios/{portfolio_id}

Get one portfolio (404 if not owned).

## Alerts

### GET /alerts/

List alerts for the authenticated user.

### POST /alerts/

Create alert (`dip_threshold`: threshold = drawdown vs rolling high, e.g. `0.05`; `price_below`: threshold = max price).

## Reports

### POST /reports/dips/csv

Run dip analysis and download results as CSV.

**Body:** Same as `POST /analysis/dips`.

### POST /reports/dips/pdf

PDF export. *(Not yet implemented — returns 501)*
