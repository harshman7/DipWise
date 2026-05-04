# API Reference

Base URL: `http://localhost:8000`

Interactive docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

**Authentication:** Disabled in this revision. There are no `/auth/*` routes; portfolio and alert endpoints are unauthenticated stubs (see below).

## Health

### GET /health

Returns service status.

**Response:**

```json
{ "status": "ok", "service": "dipwise-api" }
```

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

Returns an empty list (stub until auth returns).

### GET /portfolios/{portfolio_id}

Returns **501 Not Implemented**.

## Alerts

### GET /alerts/

Returns an empty list (stub until auth returns).

### POST /alerts/

Returns **501 Not Implemented** (stub).

## Reports

### POST /reports/dips/csv

Run dip analysis and download results as CSV.

**Body:** Same as `POST /analysis/dips`.

### POST /reports/dips/pdf

PDF export. *(Not yet implemented — returns 501)*
