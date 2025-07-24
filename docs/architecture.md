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
- **Routing:** React Router v6 with a sidebar-based `AppLayout`. **Public:** dashboard (`/`), compare (`/compare`), moving averages (`/moving-averages`), dip backtester (`/backtester`), reports (`/reports`), login (`/login`). **Protected (`RequireAuth`):** portfolio (`/portfolio`), watchlists (`/watchlist`), alerts (`/alerts`). **Saved backtests** use authenticated **`/saved-backtests`** from the API; the backtester page shows a save action when the user is logged in.
- **Data Fetching:** TanStack Query; `lib/api.ts` uses the Orval-generated client from `@dipwise/shared` for dip analysis; raw `fetch` remains for simple helpers.
- **Forms:** React Hook Form with Zod schema validation.
- **Charts:** Recharts (LineChart for dip visualization; more chart types planned).

## Backend

- **Framework:** FastAPI with auto-generated OpenAPI docs at `/docs`.
- **Structure:** Router → Service → Model pattern. Routers are thin HTTP handlers; services contain business logic; models define the DB schema.
- **Validation:** Pydantic v2 models for all request/response schemas.
- **Database:** PostgreSQL via SQLAlchemy 2.0 (synchronous engine with `psycopg2`).
- **Migrations:** Alembic with a hand-written initial migration covering all 12 tables.
- **Auth:** JWT via [`/auth/login`](apps/api/app/routers/auth.py) and [`HTTPBearer`](apps/api/app/core/deps.py). [`apps/api/app/core/security.py`](apps/api/app/core/security.py) hashes passwords and issues tokens. Portfolios, alerts, watchlists, and news require a valid Bearer token.

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
  - `run_check_alerts` every 10 minutes — evaluates `dip_threshold`, `price_below`, and `sma_cross` alerts against DB prices and inserts `alert_events` (one per alert per calendar day max).

Docker Compose includes `celery_worker` and `celery_beat` services alongside `api`, `postgres`, `redis`, and `web`.

## External APIs

- **Market data:** `market_data_service.py` — Yahoo Finance via `yfinance` (default), or Polygon daily aggregates / Alpha Vantage `TIME_SERIES_DAILY_ADJUSTED` when `MARKET_DATA_PROVIDER` and `MARKET_DATA_API_KEY` are set. Ingestion persists to `daily_prices`.
- **News:** `sentiment_service.py` fetches headlines via NewsAPI when `NEWS_API_KEY` is set; optional persistence into `news_items` can be added later.

## OpenAPI client

- Export: `apps/api/scripts/export_openapi.py` writes `packages/shared/openapi.json`.
- Generate: `npm run codegen:api` (repo root) runs export + Orval (`packages/shared/orval.config.cjs`) into `packages/shared/src/generated/api.ts`.
- Frontend imports `@dipwise/shared` (`dipwiseFetch` mutator sets base URL; optional Bearer when auth returns).

## Deployment (Future)

- Containerized via Docker Compose for development.
- Production: managed PostgreSQL (e.g. AWS RDS, Supabase), managed Redis (ElastiCache), container orchestration (ECS/Fly.io/Railway), TLS termination, environment-based secrets.


<!-- revision 2026-02-04: Dip detection baselines -->
**2026-02-04 — Dip detection baselines.** Documented rolling-high lookback defaults and how threshold fractions map to UI percent inputs.


<!-- revision 2026-03-30: Alert types matrix -->
**2026-03-30 — Alert types matrix.** Tabulated dip_threshold vs price_below vs sma_cross evaluation cadence.


<!-- revision 2026-05-23: Reports CSV/PDF -->
**2026-05-23 — Reports CSV/PDF.** Linked export endpoints to shared `DipAnalysisRequest` body schema.


<!-- revision 2026-07-16: Docker compose topology -->
**2026-07-16 — Docker compose topology.** Sketched api/web/postgres/redis/worker/beat/migrate service relationships.


<!-- revision 2026-09-08: Recharts brush zoom -->
**2026-09-08 — Recharts brush zoom.** Captured backtester chart brush behavior and dip marker layering.

<!-- 2024-10-02 pass 7: Recharts tooling -->
**2024-10-02** — Cross-linked README sections with Recharts tooling. Pass 7/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2024-11-22 pass 14: moving averages -->
**2024-11-22** — Expanded sandbox notes on moving averages. Pass 14/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-01-11 pass 21: testing strategy -->
**2025-01-11** — Captured QA checklist items for testing strategy. Pass 21/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-04-17 pass 28: testing strategy -->
**2025-04-17** — Annotated developer workflow around testing strategy. Pass 28/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-06-08 pass 35: news integration -->
**2025-06-08** — Recorded follow-ups for news integration. Pass 35/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-07-23 pass 42: OpenAPI codegen -->
**2025-07-23** — Annotated developer workflow around OpenAPI codegen. Pass 42/100 in the sandbox documentation sweep; no runtime code changed.
