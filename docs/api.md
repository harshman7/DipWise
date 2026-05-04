# API Reference

Base URL: `http://localhost:8000`

Interactive docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

**Authentication:** JWT bearer. Call `POST /auth/login` with email and password; send the returned `access_token` as `Authorization: Bearer <token>` on protected routes. The generated TypeScript client (`@dipwise/shared`) reads the token from `localStorage` key `dipwise_token`.

## Health

### GET /health

Returns service status (public).

## Auth

### POST /auth/register

Create an account. Body: `email`, `password` (min 8 chars), optional `full_name`. **409** if email exists.

### POST /auth/login

Body: `email`, `password`. Returns `{ "access_token": "...", "token_type": "bearer" }`.

### GET /auth/me

Current user profile (requires bearer).

## Assets

### GET /assets/

List tracked assets from the database (public).

### GET /assets/{symbol}

Get one asset by ticker (public). **404** if not in DB (primed via `/prices/...` or watchlist/alert flows).

## Prices

### GET /prices/{symbol}?start=YYYY-MM-DD&end=YYYY-MM-DD

Historical daily bars from `daily_prices`, backfilled from the configured market provider when missing or stale (`PRICE_STALE_DAYS`).

### POST /prices/{symbol}/refresh?start=...&end=...

Force provider fetch for the range and upsert DB.

## Analysis

### POST /analysis/dips

Detect dips and backtest buy-the-dip vs DCA (public).

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

## Portfolios (authenticated)

### GET /portfolios/

List portfolios for the current user.

### POST /portfolios/

Create a portfolio. Body: `name`, optional `description`.

### GET /portfolios/{portfolio_id}

Portfolio detail including `positions` (symbol, shares, avg cost). **404** if not owned.

## Alerts (authenticated)

### GET /alerts/

List alerts for the current user.

### POST /alerts/

Create an alert. Body: `threshold`, `alert_type` (`dip_threshold` | `price_below`), optional `message`, and either **`symbol`** or **`asset_id`**.

## Watchlists (authenticated)

### GET /watchlists/

### POST /watchlists/

Body: `{ "name": "..." }`

### DELETE /watchlists/{watchlist_id}

### GET /watchlists/{watchlist_id}/items

### POST /watchlists/{watchlist_id}/items

Body: `{ "symbol": "VOO" }`

### DELETE /watchlists/{watchlist_id}/items/{item_id}

## News (authenticated)

### GET /news/{symbol}

Headlines from NewsAPI.org when `NEWS_API_KEY` is set; otherwise `articles` may be empty and `provider_note` explains why.

## Reports

### POST /reports/dips/csv

Run dip analysis and download CSV (metadata comment lines + event rows). Public.

### POST /reports/dips/pdf

Run dip analysis and download a PDF report. Public.

**Body:** Same as `POST /analysis/dips`.
