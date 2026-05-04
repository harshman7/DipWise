# Architecture

## Overview

DipWise is a monorepo with three main modules:

```
apps/web     — React SPA (Vite, TypeScript, TailwindCSS)
apps/api     — FastAPI REST API (Python, SQLAlchemy)
infra/       — Docker configuration for local and production deployments
```

## Frontend

- **Framework:** React 18 with TypeScript, bundled by Vite.
- **Styling:** TailwindCSS with a custom `brand` color scale.
- **Routing:** React Router v6 with a sidebar-based `AppLayout`.
- **Data Fetching:** TanStack Query for server state; a thin `fetch` wrapper in `lib/api.ts`.
- **Forms:** React Hook Form with Zod schema validation.
- **Charts:** Recharts (LineChart for dip visualization; more chart types planned).
- **State:** Component-local state for now; global auth state will be added with JWT integration.

## Backend

- **Framework:** FastAPI with auto-generated OpenAPI docs at `/docs`.
- **Structure:** Router → Service → Model pattern. Routers are thin HTTP handlers; services contain business logic; models define the DB schema.
- **Validation:** Pydantic v2 models for all request/response schemas.
- **Database:** PostgreSQL via SQLAlchemy 2.0 (synchronous engine with `psycopg2`).
- **Migrations:** Alembic with a hand-written initial migration covering all 12 tables.
- **Auth:** JWT-based (jose + passlib/bcrypt). Token creation/verification utilities are implemented; route-level auth middleware is planned.

## Database

PostgreSQL 16. See [data-model.md](data-model.md) for the full schema.

Key relationships:
- A **user** owns portfolios, watchlists, alerts, and saved backtests.
- An **asset** has daily prices, can appear in portfolio positions, watchlist items, and alerts.
- **Alert events** record historical trigger occurrences for an alert.
- **News items** are optionally linked to an asset.

## Background Workers

Celery with Redis as broker and result backend. Current tasks:

- `ping` — connectivity test.
- `check_alerts` — placeholder for periodic alert evaluation.

Future tasks: scheduled data ingestion, alert evaluation, report generation.

## External APIs

Placeholder service stubs exist for:

- **Market data:** `market_data_service.py` — will integrate Yahoo Finance, Polygon, or Alpha Vantage.
- **News sentiment:** `sentiment_service.py` — will integrate NewsAPI or Finnhub.

API keys are configured via environment variables and are not required for local development (mock data is used).

## Deployment (Future)

- Containerized via Docker Compose for development.
- Production: managed PostgreSQL (e.g. AWS RDS, Supabase), managed Redis (ElastiCache), container orchestration (ECS/Fly.io/Railway), TLS termination, environment-based secrets.
