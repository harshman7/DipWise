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

### GET /prices/{symbol}

Query:

| Param | Type | Description |
|-------|------|-------------|
| `start` | date (required) | Range start (ISO date). |
| `end` | date (required) | Range end (inclusive). |
| `sma_periods` | int[] (optional) | Repeat query param, e.g. `sma_periods=100`. Each N must be 2–500. When `100` is included, each bar may include **`sma_100`**. |
| `ema_periods` | int[] (optional) | Same pattern; **`ema_100`** when period 100 requested. |

Behavior: rows are returned only for `start`–`end`, but the server may load **earlier history** (warmup) so SMA/EMA are defined from the first visible day when enough prior data exists in the DB.

Response: `symbol`, `start`, `end`, `prices[]` with OHLCV plus optional `sma_100`, `ema_100` (when period 100 requested), and **`sma_by_period` / `ema_by_period`** string-keyed maps for every requested period (empty objects when not requested).

### POST /prices/{symbol}/refresh?start=...&end=...

Force provider fetch for the range and upsert DB. Same optional `sma_periods` / `ema_periods` as GET.

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

`dip_threshold` is a **fraction** (e.g. `0.05` = 5% drawdown from rolling high).

## Portfolios (authenticated)

### GET /portfolios/

List portfolios for the current user.

### POST /portfolios/

Create a portfolio. Body: `name`, optional `description`.

### GET /portfolios/{portfolio_id}

Portfolio detail including `positions` (symbol, shares, avg cost). **404** if not owned.

### POST /portfolios/{portfolio_id}/transactions

Append a **buy** or **sell** and update derived positions (weighted average cost on buys; sells reduce shares, cost basis unchanged on remainder). Body: `symbol`, `tx_type` (`buy` | `sell`), `shares` (> 0), `price` (> 0), optional `executed_at` (ISO datetime; default now).

### GET /portfolios/{portfolio_id}/transactions

Optional query: `limit` (default 50, max 200), `offset` (default 0). Chronological list of transactions for that portfolio.

## Alerts (authenticated)

### GET /alerts/

List alerts for the current user.

### POST /alerts/

Create an alert. Body:

- `symbol` **or** `asset_id` (one required with non-empty symbol when using symbol).
- `alert_type`: `dip_threshold` | `price_below` | `sma_cross`
- `threshold`: numeric (meaning depends on type; for `sma_cross` use `0` if unused).
- `message` (optional)
- `params_json` (required for `sma_cross`): `{ "kind": "sma_cross", "period": 100, "direction": "below" | "above" }`

Celery **`run_check_alerts`** evaluates alerts against `daily_prices` and inserts **`alert_events`** (at most one per alert per UTC calendar day).

### GET /alerts/events

Recent firings across the user’s alerts. Query: `limit` (default 50, max 200). Each row includes alert metadata and `price_at_trigger`, `triggered_at`, `details`.

## Watchlists (authenticated)

### GET /watchlists/

### POST /watchlists/

Body: `{ "name": "..." }`

### DELETE /watchlists/{watchlist_id}

### GET /watchlists/{watchlist_id}/items

### POST /watchlists/{watchlist_id}/items

Body: `{ "symbol": "VOO" }`

### DELETE /watchlists/{watchlist_id}/items/{item_id}

## Saved backtests (authenticated)

### GET /saved-backtests/

List saved runs for the user (newest first).

### POST /saved-backtests/

Body: `symbol`, `parameters` (JSON object), `results` (JSON object). Persists a snapshot after a client-side analysis (e.g. from `/analysis/dips`).

### GET /saved-backtests/{id}

One saved backtest **404** if not owned.

## News (authenticated)

### GET /news/{symbol}

Headlines from NewsAPI.org when `NEWS_API_KEY` is set; otherwise `articles` may be empty and `provider_note` explains why.

## Reports

### POST /reports/dips/csv

Run dip analysis and download CSV (metadata comment lines + event rows). Public.

### POST /reports/dips/pdf

Run dip analysis and download a PDF report. Public.

**Body:** Same as `POST /analysis/dips`.


<!-- revision 2026-02-13: Backtester holding periods -->
**2026-02-13 — Backtester holding periods.** Aligned preset chips (30/90/180/365/730) with API `holding_period_days` validation notes.


<!-- revision 2026-04-08: SMA cross params JSON -->
**2026-04-08 — SMA cross params JSON.** Documented Alembic `002` `params_json` shape for cross direction and period.


<!-- revision 2026-06-01: Watchlist CRUD flows -->
**2026-06-01 — Watchlist CRUD flows.** Summarized authenticated watchlist endpoints and UI expectations.


<!-- revision 2026-07-25: Market data providers -->
**2026-07-25 — Market data providers.** Compared Yahoo default vs Polygon/Alpha Vantage key requirements.


<!-- revision 2026-09-17: Popular tickers constant -->
**2026-09-17 — Popular tickers constant.** Explained curated list purpose for quick symbol entry.

<!-- 2024-08-30 pass 1: news integration -->
**2024-08-30** — Captured QA checklist items for news integration. Pass 1/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2024-10-04 pass 8: data model -->
**2024-10-04** — Recorded follow-ups for data model. Pass 8/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2024-11-28 pass 15: alert evaluation -->
**2024-11-28** — Documented edge cases and defaults for alert evaluation. Pass 15/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-01-15 pass 22: TanStack Query -->
**2025-01-15** — Added revision footers covering TanStack Query. Pass 22/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-05-14 pass 29: watchlist flows -->
**2025-05-14** — Documented edge cases and defaults for watchlist flows. Pass 29/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-06-09 pass 36: TanStack Query -->
**2025-06-09** — Cross-linked README sections with TanStack Query. Pass 36/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-07-29 pass 43: Docker compose -->
**2025-07-29** — Annotated developer workflow around Docker compose. Pass 43/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-10-09 pass 50: backtester UX -->
**2025-10-09** — Aligned changelog entries with backtester UX. Pass 50/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-11-25 pass 57: moving averages -->
**2025-11-25** — Aligned changelog entries with moving averages. Pass 57/100 in the sandbox documentation sweep; no runtime code changed.
