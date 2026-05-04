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
- **Optional SMA / EMA** — Query params `sma_periods` and `ema_periods` (repeatable ints, clamped). Server loads **warmup history** before `start` so indicators are valid from the first day in range. Response fields: `sma_100` when `100` is requested, `ema_100` when `100` is requested.
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
| `/compare` | Up to **6** symbols; **normalized** performance (rebased to 100); optional **100-day SMA** overlay (rebased to match the same scale) |
| `/moving-averages` | Multi-symbol **table**: last bar, **SMA 100**, **EMA 100**, % vs SMA |
| `/backtester` | **Dip Backtester**: percent **dip threshold** UI, **preset holding-period chips** (30 / 90 / 180 / 365 / 730), responsive ticker search, two-column filter layout on large screens, helper copy, **Recharts** price/dip/SMA chart with **Brush** (range zoom), **interactive cards** on results |
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

---

## What’s left / gaps

These are known follow-ups—not an exhaustive product roadmap.

### Documentation drift

- [`docs/api.md`](docs/api.md) should be updated to document **`sma_periods` / `ema_periods`** on prices, **`sma_cross`** + **`params_json`** on alerts, and any response field additions (`sma_100`, `ema_100`).
- [`docs/architecture.md`](docs/architecture.md) may still mention **public-only routing** in places; the **actual app** uses **`RequireAuth`** for portfolio, watchlist, and alerts—worth aligning when you next edit docs.

### Product / UX

- **Portfolio & transactions** — UI/API are not a full broker-grade ledger; **CRUD for positions and transactions** is still a natural next step (also listed previously in roadmap ideas).
- **Compare / Moving Averages** — EMA overlay on Compare, user-selectable MA periods in the MA table, and richer multi-symbol dashboards are optional.
- **Backtester** — Could surface **EMA** on the same chart as SMA; strategy presets (save/load) are not built.
- **Alerts** — No email/push delivery; events are stored for in-app / API use only unless you integrate notifications.
- **Frontend tests** — No systematic E2E or component test suite documented; only backend `pytest` is called out in this README.

### Infrastructure and hardening

- **Production** — See checklist below and `infra/docker/docker-compose.prod.example.yml` (sketch only); secrets, TLS, managed DB/Redis.
- **Dependencies** — Occasional **passlib / bcrypt** or `pandas`/provider stack version alignment across environments (historic note in roadmap).

### Data / quality

- **Corporate actions** — Adjusted close depends on provider quality; no separate validation pipeline.
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

---

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness |
| POST | `/auth/register` | No | Create user |
| POST | `/auth/login` | No | JWT |
| GET | `/auth/me` | Yes | Profile |
| POST | `/analysis/dips` | No | Dip detection + backtest |
| GET | `/prices/{symbol}` | No | Daily bars; optional `sma_periods`, `ema_periods` |
| POST | `/prices/{symbol}/refresh` | No | Force provider refresh |
| GET | `/assets/`, `/assets/{symbol}` | No | Tracked assets |
| GET | `/news/{symbol}` | Yes | Headlines if configured |
| GET/POST | `/portfolios/…` | Yes | Portfolios |
| GET/POST | `/alerts/…` | Yes | Alerts (`dip_threshold`, `price_below`, `sma_cross`) |
| GET/POST/DELETE | `/watchlists/…` | Yes | Watchlists |
| POST | `/reports/dips/csv`, `/reports/dips/pdf` | No | Exports |

**Full reference:** [docs/api.md](docs/api.md) (update as endpoints evolve).

---

## Further reading

- [docs/architecture.md](docs/architecture.md) — Workers, external APIs, codegen.
- [docs/data-model.md](docs/data-model.md) — Tables and relationships.
- [docs/api.md](docs/api.md) — Endpoint reference (keep in sync with OpenAPI).

**Prior roadmap ideas (still valid):** richer portfolio transactions; deeper news/NLP; dependency hygiene across environments.
