# DipWise

Investment analytics platform for comparing stocks/ETFs, detecting historical price dips, backtesting buy-the-dip strategies, tracking portfolios, and generating reports.

> **Disclaimer:** DipWise is for educational and historical backtesting purposes only. Nothing in this application constitutes financial advice. Always do your own research before making investment decisions.

## Features

- **Dip Detection** — Identify price dips relative to rolling highs with configurable thresholds.
- **Backtest Engine** — Simulate buy-the-dip strategies and compare against dollar-cost averaging.
- **Asset Comparison** — Normalized performance chart for two symbols over a date range.
- **Portfolio Tracking** — Create portfolios and view positions (protected).
- **Watchlists** — Create lists and symbols for Celery price ingestion (protected).
- **Alerts** — Dip-threshold and price-below alerts (protected).
- **Reports** — Export dip analysis to CSV (with summary header) or PDF.
- **News** — Optional headlines via NewsAPI.org when `NEWS_API_KEY` is set (protected API + UI when signed in).

## Architecture

```
apps/web/          React + TypeScript + Vite frontend
apps/api/          FastAPI + SQLAlchemy backend
packages/shared/   OpenAPI-generated client and types (Orval)
infra/docker/      Dockerfiles
docs/              Documentation
```

The backend follows a service-layer pattern: routers handle HTTP, services contain business logic, models define the database schema, and schemas validate API payloads.

See [docs/architecture.md](docs/architecture.md) for the full breakdown.

## Quick Start

### Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000
- API docs: http://localhost:8000/docs
- PostgreSQL from your host (psql, GUI): **localhost:5433** by default — avoids clashing with a local Postgres on 5432. Override with `POSTGRES_PUBLISH_PORT` in `.env`.
- **Migrations:** A one-off `migrate` service runs `alembic upgrade head` before `api`, `celery_worker`, and `celery_beat` start.
- **Auth:** Register and sign in at **/login**. JWT is stored in `localStorage` as `dipwise_token` for API calls. Portfolio, watchlist, and alerts routes require authentication.

### Local development (without Docker)

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

Requires PostgreSQL and Redis running locally (update `.env` with local URLs).

## Environment Variables

| Variable              | Description                                  | Default                    |
|-----------------------|----------------------------------------------|----------------------------|
| `POSTGRES_USER`       | PostgreSQL username                          | `dipwise`                  |
| `POSTGRES_PASSWORD`   | PostgreSQL password                          | `dipwise_secret`           |
| `POSTGRES_DB`         | PostgreSQL database name                     | `dipwise`                  |
| `POSTGRES_PUBLISH_PORT` | Host port mapped to Postgres (container still listens on 5432) | `5433` |
| `DATABASE_URL`        | Full database connection string              | (compose default)          |
| `REDIS_URL`           | Redis connection string                      | `redis://redis:6379/0`     |
| `JWT_SECRET_KEY`      | Secret for signing JWT access tokens         | (change in production)    |
| `MARKET_DATA_PROVIDER`| `yahoo` \| `polygon` \| `alphavantage`      | `yahoo`                    |
| `MARKET_DATA_API_KEY` | Polygon or Alpha Vantage API key              | (empty for Yahoo)          |
| `NEWS_API_KEY`        | [NewsAPI.org](https://newsapi.org/) key       | (empty; news optional)     |
| `VITE_API_BASE_URL`   | Backend API URL for the frontend             | `http://localhost:8000`    |

## Production checklist (summary)

- Strong `POSTGRES_PASSWORD`, `JWT_SECRET_KEY`, and Redis credentials.
- TLS at the edge (reverse proxy or load balancer); do not expose Postgres/Redis.
- Use managed Postgres/Redis where possible.
- See [infra/docker/docker-compose.prod.example.yml](infra/docker/docker-compose.prod.example.yml) as a sketch only.

## API client codegen

Regenerate the TypeScript client and `openapi.json` after backend API changes:

```bash
# from repo root; requires Python 3 with apps/api dependencies
npm run codegen:api
```

This runs `apps/api/scripts/export_openapi.py` and Orval in `packages/shared`.

## Tests

```bash
cd apps/api && python3 -m pytest app/tests/ -q
```

## API Overview

| Method | Path              | Status       | Description                     |
|--------|-------------------|--------------|---------------------------------|
| GET    | `/health`         | Implemented  | Service health check            |
| POST   | `/auth/register` | Implemented  | Create account                  |
| POST   | `/auth/login`    | Implemented  | JWT access token                |
| GET    | `/auth/me`       | Implemented  | Current user (bearer)         |
| POST   | `/analysis/dips`  | Implemented  | Dip detection + backtest        |
| POST   | `/reports/dips/csv` | Implemented | CSV export                      |
| POST   | `/reports/dips/pdf` | Implemented | PDF export                      |
| GET    | `/assets/`        | Implemented  | List tracked assets             |
| GET    | `/assets/{symbol}`| Implemented  | Single asset                   |
| GET    | `/prices/{symbol}`| Implemented  | DB + provider backfill          |
| POST   | `/prices/{symbol}/refresh` | Implemented | Force provider refresh |
| GET    | `/news/{symbol}` | Implemented  | Headlines (bearer, optional key) |
| GET    | `/portfolios/`    | Implemented  | User portfolios (bearer)       |
| POST   | `/portfolios/`    | Implemented  | Create portfolio (bearer)     |
| GET    | `/portfolios/{id}` | Implemented | Detail + positions (bearer)     |
| GET    | `/alerts/`        | Implemented  | User alerts (bearer)           |
| POST   | `/alerts/`        | Implemented  | Create alert (bearer)          |
| GET/POST/DELETE | `/watchlists/...` | Implemented | Watchlists (bearer) |

Full endpoint reference: [docs/api.md](docs/api.md)

## Roadmap ideas

- CRUD for portfolio positions and transactions via API/UI.
- Deeper sentiment / NLP on headlines.
- Hardening passlib/bcrypt versions across all environments.
