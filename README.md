# DipWise

**DipWise** is a full-stack investment analytics monorepo: compare ETFs/stocks, detect historical drawdowns from rolling highs, backtest “buy the dip” vs dollar-cost averaging, inspect moving averages, and (with an account) track portfolios, watchlists, and alerts. Market data is persisted in PostgreSQL and can be refreshed from Yahoo Finance (default) or optional Polygon / Alpha Vantage providers.

> **Disclaimer:** DipWise is for **educational and historical backtesting only**. Nothing here is financial advice. Past performance does not guarantee future results.

---

## Table of contents

- [What’s implemented](#whats-implemented)
- [What’s left / gaps](#whats-left--gaps)
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [API client codegen](#api-client-codegen)
- [Tests](#tests)
- [API overview](#api-overview)
- [Further reading](#further-reading)

---

## What’s implemented

### Core analytics (backend)

- **Dip detection** — Rolling high over configurable calendar-window lookback; drawdown threshold (fraction 0–1) defines a dip; first day of each “episode” in the user’s date range.
- **Backtest** — Fixed notional per dip vs **DCA** baseline over the same cash deployment schedule; per-dip **holding-period returns** (e.g. 30 / 90 / 180 / 365 / 730 trading days).
- **Analysis endpoint** — `POST /analysis/dips` accepts `DipAnalysisRequest` (symbol, date range, threshold, investment amount, lookback, `holding_period_days` array). **Public** (no auth required).

### Prices and technical indicators

- **`GET /prices/{symbol}`** — Daily OHLCV + `adj_close` from `daily_prices`, with **provider backfill** when data is missing or stale (`PRICE_STALE_DAYS`).
- **Optional SMA / EMA** — Query params `sma_periods` and `ema_periods` (repeatable ints, clamped). Server loads **warmup history** before `start` so indicators are valid from the first day in range. Response includes legacy **`sma_100` / `ema_100`** when period `100` is requested, plus **`sma_by_period` / `ema_by_period`** maps for all requested periods.
- **`POST /prices/{symbol}/refresh`** — Force re-fetch for a range (same indicator query params supported).
- **Implementation** — [`apps/api/app/services/indicator_service.py`](apps/api/app/services/indicator_service.py) (pandas rolling mean + EWMA span); logic wired in [`apps/api/app/routers/prices.py`](apps/api/app/routers/prices.py).

### Alerts

- **Types** — `dip_threshold` (drawdown vs rolling high, same idea as backtester), `price_below` (absolute close), **`sma_cross`** (close crosses **above** or **below** a simple moving average of configurable period).
- **Storage** — `params_json` on `alerts` (Alembic revision `002`) for SMA cross (`kind: "sma_cross"`, `period`, `direction`).
- **Evaluation** — Celery **`run_check_alerts`** (scheduled) runs `check_alerts`; at most **one `alert_event` per alert per calendar day**.

### Background jobs

- **Celery worker + Redis** — Price ingestion for symbols referenced by active alerts/watchlists plus `SPY`; alert checking on a beat schedule.
- **Docker Compose** — `api`, `web`, `postgres`, `redis`, `celery_worker`, `celery_beat`; **`migrate`** one-off runs `alembic upgrade head` before app containers.

### Authentication and protected surfaces

- **JWT** — Register / login; bearer token used by the generated client from `localStorage` (`dipwise_token`).
- **Frontend** — [`apps/web/src/App.tsx`](apps/web/src/App.tsx): **Portfolio**, **Watchlist**, and **Alerts** sit under `RequireAuth`. Dashboard, Compare, Moving Averages, Dip Backtester, Reports, and **`/login`** are **public** for browsing and analysis.

### Frontend (React + Vite + Tailwind)

| Route | Purpose |
|-------|---------|
| `/` | Dashboard with quick links |
| `/compare` | Up to **6** symbols; **normalized** performance (rebased to 100); optional **100-day SMA** and **EMA** overlays (rebased) |
| `/moving-averages` | Multi-symbol **table**: last bar, **configurable SMA/EMA period** (preset days), % vs SMA |
| `/backtester` | **Dip Backtester**: percent **dip threshold** UI, **preset holding-period chips** (30 / 90 / 180 / 365 / 730), responsive ticker search, two-column filter layout on large screens, helper copy, **Recharts** price/dip/**SMA+EMA** chart with **Brush** (range zoom), **save run** (authenticated) to **`saved_backtests`**, **interactive cards** on results |
| `/reports` | CSV / PDF export from dip analysis |
| `/login` | Auth |
| `/portfolio`, `/watchlist`, `/alerts` | Authenticated CRUD-style flows (see gaps below) |

**Stack details:** TanStack Query, React Hook Form + Zod, Recharts, shared types from **`@dipwise/shared`** (Orval).

### Reports

- **`POST /reports/dips/csv`** and **`POST /reports/dips/pdf`** — Same body as `/analysis/dips`; public.

### News (optional)

- **`GET /news/{symbol}`** — When `NEWS_API_KEY` is set; **requires bearer** in the API. Backtester shows headlines when the user is signed in.

### Developer experience

- **OpenAPI → TypeScript** — `npm run codegen:api` exports spec and runs Orval into [`packages/shared`](packages/shared).
- **Backend tests** — `pytest` under `apps/api/app/tests/` (health, auth, dip detection, prices + indicators, SMA cross alerts, etc.).
- **Frontend tests** — Vitest + Testing Library in `apps/web` (`npm test`); smoke tests for auth routing (`RequireAuth`).

---

## What’s left / gaps

These are known follow-ups—not an exhaustive product roadmap.

### Documentation drift

- Keep [`docs/api.md`](docs/api.md) and [`docs/architecture.md`](docs/architecture.md) aligned when you add endpoints or change routing.

### Product / UX

- **Portfolio** — Further broker-grade reporting (cost basis lots, dividends) if needed beyond transactions + positions.
- **Alerts** — No email/push delivery yet; events are stored and visible in-app via **`GET /alerts/events`**.

### Infrastructure and hardening

- **Production** — See checklist in [`infra/docker/docker-compose.prod.example.yml`](infra/docker/docker-compose.prod.example.yml); secrets, TLS, managed DB/Redis.

### Data / quality

- **Corporate actions** — Adjusted close depends on provider quality; no separate validation pipeline in-app.
- **Staleness** — `PRICE_STALE_DAYS` drives refresh; real-time quotes are out of scope.

---

## Architecture

```
apps/web/          React + TypeScript + Vite frontend
apps/api/          FastAPI + SQLAlchemy backend
packages/shared/   OpenAPI + Orval-generated client (`openapi.json`, `api.ts`)
infra/docker/      Dockerfiles and Compose
docs/              Architecture, data model, API notes
```

The backend uses **routers → services → models**; Pydantic schemas validate I/O.

**Deeper detail:** [docs/architecture.md](docs/architecture.md) · **ERD / tables:** [docs/data-model.md](docs/data-model.md) · **HTTP reference (partial):** [docs/api.md](docs/api.md)

---

## Quick start

### Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL / note |
|---------|------------|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| PostgreSQL (host) | **localhost:5433** by default (`POSTGRES_PUBLISH_PORT`) so it does not clash with a local Postgres on 5432 |

**Migrations:** The `migrate` job applies **`alembic upgrade head`** (includes revision **`002`** for `alerts.params_json`) before dependent services start.

**Auth:** Create an account at **`/login`** to use Portfolio, Watchlist, and Alerts. Other analysis pages work without signing in.

### Local development (no Docker)

**Backend:**

```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd apps/web
npm install
npm run dev
```

You need **PostgreSQL** and **Redis** locally; point `DATABASE_URL` and `REDIS_URL` in `.env` accordingly.

---

## Environment variables

| Variable | Description | Default / notes |
|----------|-------------|------------------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database identity | See `.env.example` |
| `POSTGRES_PUBLISH_PORT` | Host port for Postgres | `5433` |
| `DATABASE_URL` | SQLAlchemy URL | Set for compose or local |
| `REDIS_URL` | Celery broker | e.g. `redis://redis:6379/0` |
| `JWT_SECRET_KEY` | Signing key for JWT | Change in production |
| `MARKET_DATA_PROVIDER` | `yahoo` · `polygon` · `alphavantage` | `yahoo` |
| `MARKET_DATA_API_KEY` | Polygon / Alpha Vantage | Empty for Yahoo |
| `NEWS_API_KEY` | NewsAPI.org | Optional |
| `VITE_API_BASE_URL` | API origin for the SPA | `http://localhost:8000` |

---

## Production checklist (summary)

- Strong `POSTGRES_PASSWORD`, `JWT_SECRET_KEY`, and Redis credentials.
- TLS at the edge; do not expose Postgres/Redis publicly.
- Prefer managed Postgres/Redis for production.
- See [infra/docker/docker-compose.prod.example.yml](infra/docker/docker-compose.prod.example.yml) as a starting sketch only.

---

## API client codegen

After changing FastAPI routes or schemas:

```bash
# From repo root; Python 3 with API deps available
npm run codegen:api
```

Runs `apps/api/scripts/export_openapi.py` and Orval in `packages/shared`.

---

## Tests

```bash
cd apps/api && python3 -m pytest app/tests/ -q
```

```bash
cd apps/web && npm test
```

For watch mode during frontend work: `cd apps/web && npm run test:watch`.

---

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness |
| POST | `/auth/register` | No | Create user |
| POST | `/auth/login` | No | JWT |
| GET | `/auth/me` | Yes | Profile |
| POST | `/analysis/dips` | No | Dip detection + backtest |
| GET | `/prices/{symbol}` | No | Daily bars; optional `sma_periods`, `ema_periods`; maps `sma_by_period` / `ema_by_period` |
| POST | `/prices/{symbol}/refresh` | No | Force provider refresh |
| GET | `/assets/`, `/assets/{symbol}` | No | Tracked assets |
| GET | `/news/{symbol}` | Yes | Headlines if configured |
| GET/POST | `/portfolios/…` | Yes | Portfolios; **`POST/GET …/{id}/transactions`** |
| GET/POST | `/alerts/…` | Yes | Alerts (`dip_threshold`, `price_below`, `sma_cross`) |
| GET | `/alerts/events` | Yes | Recent alert firings for the user |
| GET/POST | `/saved-backtests/…` | Yes | Persisted backtest snapshots |
| GET/POST/DELETE | `/watchlists/…` | Yes | Watchlists |
| POST | `/reports/dips/csv`, `/reports/dips/pdf` | No | Exports |

**Full reference:** [docs/api.md](docs/api.md) (update as endpoints evolve).

---

## Further reading

- [docs/architecture.md](docs/architecture.md) — Workers, external APIs, codegen.
- [docs/data-model.md](docs/data-model.md) — Tables and relationships.
- [docs/api.md](docs/api.md) — Endpoint reference (keep in sync with OpenAPI).

**Prior roadmap ideas (still valid):** outbound alert channels (email/webhook); deeper news/NLP; E2E tests (e.g. Playwright).

---

## Development log

Incremental documentation passes (sandbox); see `docs/project-journal.md`.

- `2026-02-04` — Dip detection baselines: Documented rolling-high lookback defaults and how threshold fractions map to UI percent inputs.
- `2026-02-13` — Backtester holding periods: Aligned preset chips (30/90/180/365/730) with API `holding_period_days` validation notes.
- `2026-02-22` — Compare chart overlays: Captured rebasing rules for normalized performance and optional SMA/EMA overlays.
- `2026-03-03` — Moving averages table: Specified column semantics for last bar, configurable periods, and % distance vs SMA.
- `2026-03-12` — Price ingestion staleness: Described `PRICE_STALE_DAYS` refresh behavior and provider fallback order.
- `2026-03-21` — Indicator warmup windows: Explained warmup history loaded before `start` for valid SMA/EMA on first in-range bar.
- `2026-03-30` — Alert types matrix: Tabulated dip_threshold vs price_below vs sma_cross evaluation cadence.
- `2026-04-08` — SMA cross params JSON: Documented Alembic `002` `params_json` shape for cross direction and period.
- `2026-04-17` — Celery beat schedules: Recorded ingest (30m) and alert check (10m) intervals for local Docker stacks.
- `2026-04-26` — JWT client storage: Noted `dipwise_token` localStorage contract used by generated client.
- `2026-05-05` — RequireAuth routing: Mapped public vs protected routes for smoke tests and onboarding copy.
- `2026-05-14` — Saved backtests API: Outlined persistence fields returned to the backtester save action.
- `2026-05-23` — Reports CSV/PDF: Linked export endpoints to shared `DipAnalysisRequest` body schema.
- `2026-06-01` — Watchlist CRUD flows: Summarized authenticated watchlist endpoints and UI expectations.
- `2026-06-10` — Portfolio transactions: Documented transaction POST/GET paths and position rollups.
- `2026-06-19` — OpenAPI codegen loop: Captured `npm run codegen:api` steps and Orval output location.
- `2026-06-28` — Pytest service coverage: Listed modules under `apps/api/app/tests` and what each file guards.
- `2026-07-07` — Vitest auth smoke: Described `RequireAuth` tests and public route bypass cases.
- `2026-07-16` — Docker compose topology: Sketched api/web/postgres/redis/worker/beat/migrate service relationships.
- `2026-07-25` — Market data providers: Compared Yahoo default vs Polygon/Alpha Vantage key requirements.
- `2026-08-03` — News optional surface: Clarified bearer requirement and UI gating on backtester headlines.
- `2026-08-12` — PostgreSQL schema map: Cross-referenced ERD entities to router ownership boundaries.
- `2026-08-21` — Tailwind brand palette: Noted custom `brand` scale usage in layout and cards.
- `2026-08-30` — TanStack Query patterns: Documented cache keys used on dashboard and analysis pages.
- `2026-09-08` — Recharts brush zoom: Captured backtester chart brush behavior and dip marker layering.
- `2026-09-17` — Popular tickers constant: Explained curated list purpose for quick symbol entry.
- `2026-09-26` — Error handling copy: Drafted user-facing helper text for empty states and loading.
- `2026-10-05` — API pagination gaps: Logged known limitations for list endpoints in roadmap notes.
- `2026-10-14` — Environment templates: Expanded `.
- `2026-10-23` — Release hygiene: Final pass tying journal, changelog, and architecture revision footers together.
- `2024-08-30` — news integration (pass 1).
- `2024-09-03` — Celery workers (pass 2).
- `2024-09-04` — OpenAPI codegen (pass 3).
- `2024-09-14` — compare charts (pass 4).
- `2024-09-16` — moving averages (pass 5).
- `2024-09-19` — dip detection (pass 6).
- `2024-10-02` — Recharts tooling (pass 7).
- `2024-10-04` — data model (pass 8).
- `2024-10-11` — saved backtests (pass 9).
- `2024-10-12` — dip detection (pass 10).
- `2024-10-18` — SMA/EMA indicators (pass 11).
- `2024-10-26` — Celery workers (pass 12).
- `2024-11-19` — data model (pass 13).
- `2024-11-22` — moving averages (pass 14).
- `2024-11-28` — alert evaluation (pass 15).
- `2024-12-09` — report exports (pass 16).
- `2024-12-20` — data model (pass 17).
- `2024-12-25` — SMA/EMA indicators (pass 18).
- `2025-01-05` — dip detection (pass 19).
- `2025-01-06` — auth routing (pass 20).
- `2025-01-11` — testing strategy (pass 21).
- `2025-01-15` — TanStack Query (pass 22).
- `2025-01-17` — Celery workers (pass 23).
- `2025-01-22` — price ingestion (pass 24).
- `2025-01-29` — news integration (pass 25).
- `2025-03-08` — TanStack Query (pass 26).
- `2025-03-31` — backtester UX (pass 27).
- `2025-04-17` — testing strategy (pass 28).
- `2025-05-14` — watchlist flows (pass 29).
- `2025-05-19` — TanStack Query (pass 30).
- `2025-05-23` — price ingestion (pass 31).
- `2025-05-31` — price ingestion (pass 32).
- `2025-06-02` — OpenAPI codegen (pass 33).
- `2025-06-06` — Docker compose (pass 34).
- `2025-06-08` — news integration (pass 35).
