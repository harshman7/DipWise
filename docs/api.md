# API Reference

Base URL: `http://localhost:8000`

Interactive docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

## Health

### GET /health

Returns service status.

**Response:**
```json
{ "status": "ok", "service": "dipwise-api" }
```

## Auth

### POST /auth/register

Register a new user account. *(Not yet implemented — returns 501)*

**Body:**
```json
{ "email": "user@example.com", "password": "secret", "full_name": "Jane Doe" }
```

### POST /auth/login

Authenticate and receive a JWT. *(Not yet implemented — returns 501)*

**Body:**
```json
{ "email": "user@example.com", "password": "secret" }
```

**Response:**
```json
{ "access_token": "eyJ...", "token_type": "bearer" }
```

## Assets

### GET /assets/

List all tracked assets. *(Returns empty list until data is seeded)*

### GET /assets/{symbol}

Get a single asset by ticker symbol.

## Prices

### GET /prices/{symbol}?start=YYYY-MM-DD&end=YYYY-MM-DD

Return historical daily prices for a symbol. *(Returns empty list until data provider is wired)*

## Analysis

### POST /analysis/dips

Detect historical dips and simulate a buy-the-dip strategy.

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

**Response:** `DipAnalysisResponse` with summary metrics, holding period breakdowns, and individual dip events. Currently returns deterministic mock data.

## Portfolios

### GET /portfolios/

List portfolios for the authenticated user. *(Auth not yet wired — returns empty list)*

### GET /portfolios/{portfolio_id}

Get a single portfolio with positions. *(Returns 501)*

## Alerts

### GET /alerts/

List alerts for the authenticated user. *(Returns empty list)*

### POST /alerts/

Create a new alert. *(Returns 501)*

## Reports

### POST /reports/dips/csv

Run dip analysis and download results as CSV.

**Body:** Same as `POST /analysis/dips`.

### POST /reports/dips/pdf

PDF export. *(Not yet implemented — returns 501)*
