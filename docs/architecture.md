# Architecture

## Overview

DipWise is a monorepo with three main modules:

```
apps/web     — React SPA (Vite, TypeScript, TailwindCSS)
apps/api     — FastAPI REST API (Python, SQLAlchemy)
packages/shared — Orval-generated OpenAPI client + `openapi.json`
infra/       — Docker configuration for local and production deployments
```

## Frontend

- **Framework:** React 18 with TypeScript, bundled by Vite.
- **Styling:** TailwindCSS with a custom `brand` color scale.
- **Routing:** React Router v6 with a sidebar-based `AppLayout`; all main routes are **public** (JWT/login temporarily removed).
- **Data Fetching:** TanStack Query; `lib/api.ts` uses the Orval-generated client from `@dipwise/shared` for dip analysis; raw `fetch` remains for simple helpers.
- **Forms:** React Hook Form with Zod schema validation.
- **Charts:** Recharts (LineChart for dip visualization; more chart types planned).

## Backend

- **Framework:** FastAPI with auto-generated OpenAPI docs at `/docs`.
- **Structure:** Router → Service → Model pattern. Routers are thin HTTP handlers; services contain business logic; models define the DB schema.
- **Validation:** Pydantic v2 models for all request/response schemas.
- **Database:** PostgreSQL via SQLAlchemy 2.0 (synchronous engine with `psycopg2`).
- **Migrations:** Alembic with a hand-written initial migration covering all 12 tables.
- **Auth:** Temporarily **off** — no `/auth` router. [`apps/api/app/core/security.py`](apps/api/app/core/security.py) (bcrypt/JWT helpers) remains for a future restore. `/portfolios` and `/alerts` are stubs without Bearer tokens.

## Database

PostgreSQL 16. See [data-model.md](data-model.md) for the full schema.

Key relationships:

- A **user** owns portfolios, watchlists, alerts, and saved backtests.
- An **asset** has daily prices, can appear in portfolio positions, watchlist items, and alerts.
- **Alert events** record historical trigger occurrences for an alert.
- **News items** are optionally linked to an asset.

## Background Workers

Celery with Redis as broker and result backend.

- **Worker:** `celery -A app.workers.celery_app worker`
- **Beat:** `celery -A app.workers.celery_app beat` — schedules:
  - `ingest_active_symbols` every 30 minutes — fetches ~120d history for symbols on active alerts/watchlists plus `SPY`, upserts `daily_prices`.
  - `run_check_alerts` every 10 minutes — evaluates `dip_threshold` / `price_below` alerts against DB prices and inserts `alert_events` (one per alert per calendar day max).

Docker Compose includes `celery_worker` and `celery_beat` services alongside `api`, `postgres`, `redis`, and `web`.

## External APIs

- **Market data:** `market_data_service.py` — Yahoo Finance via `yfinance` (default), or Polygon daily aggregates / Alpha Vantage `TIME_SERIES_DAILY_ADJUSTED` when `MARKET_DATA_PROVIDER` and `MARKET_DATA_API_KEY` are set. Ingestion persists to `daily_prices`.
- **News sentiment:** `sentiment_service.py` — still a stub for a future provider.

## OpenAPI client

- Export: `apps/api/scripts/export_openapi.py` writes `packages/shared/openapi.json`.
- Generate: `npm run codegen:api` (repo root) runs export + Orval (`packages/shared/orval.config.cjs`) into `packages/shared/src/generated/api.ts`.
- Frontend imports `@dipwise/shared` (`dipwiseFetch` mutator sets base URL; optional Bearer when auth returns).

## Deployment (Future)

- Containerized via Docker Compose for development.
- Production: managed PostgreSQL (e.g. AWS RDS, Supabase), managed Redis (ElastiCache), container orchestration (ECS/Fly.io/Railway), TLS termination, environment-based secrets.
