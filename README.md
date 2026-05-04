# DipWise

Investment analytics platform for comparing stocks/ETFs, detecting historical price dips, backtesting buy-the-dip strategies, tracking portfolios, and generating reports.

> **Disclaimer:** DipWise is for educational and historical backtesting purposes only. Nothing in this application constitutes financial advice. Always do your own research before making investment decisions.

## Features

- **Dip Detection** — Identify price dips relative to rolling highs with configurable thresholds.
- **Backtest Engine** — Simulate buy-the-dip strategies and compare against dollar-cost averaging.
- **Asset Comparison** — Side-by-side analysis of stocks and ETFs.
- **Portfolio Tracking** — Track positions, transactions, and performance.
- **Watchlists** — Monitor assets of interest.
- **Alerts** — Configure dip threshold notifications.
- **Reports** — Export analysis results to CSV/PDF.
- **News Sentiment** — Overlay market news with sentiment scores (planned).

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

### Local development (without Docker)

**Backend:**

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
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
| `DATABASE_URL`        | Full database connection string              | (compose default)          |
| `REDIS_URL`           | Redis connection string                      | `redis://redis:6379/0`     |
| `JWT_SECRET_KEY`      | Secret key for JWT token signing             | (change in production)     |
| `MARKET_DATA_PROVIDER`| `yahoo` \| `polygon` \| `alphavantage`      | `yahoo`                    |
| `MARKET_DATA_API_KEY` | Polygon or Alpha Vantage API key              | (empty for Yahoo)          |
| `NEWS_API_KEY`        | News provider API key                        | (empty)                    |
| `VITE_API_BASE_URL`   | Backend API URL for the frontend             | `http://localhost:8000`    |

## API client codegen

Regenerate the TypeScript client and `openapi.json` after backend APIchanges:

```bash
# from repo root; requires Python venv with apps/api dependencies
npm run codegen:api
```

This runs `apps/api/scripts/export_openapi.py` and Orval in `packages/shared`.

## API Overview

| Method | Path              | Status       | Description                     |
|--------|-------------------|--------------|---------------------------------|
| GET    | `/health`         | Implemented  | Service health check            |
| POST   | `/analysis/dips`  | Implemented  | Dip detection + backtest (real provider data) |
| POST   | `/reports/dips/csv` | Implemented | CSV export of dip analysis      |
| POST   | `/auth/register`  | Implemented  | User registration + JWT         |
| POST   | `/auth/login`     | Implemented  | JSON login + JWT                |
| POST   | `/auth/token`     | Implemented  | OAuth2 form login (Swagger)     |
| GET    | `/auth/me`        | Implemented  | Current user (Bearer)           |
| GET    | `/assets/`        | Stub         | List tracked assets             |
| GET    | `/prices/{symbol}`| Implemented  | DB + provider backfill          |
| POST   | `/prices/{symbol}/refresh` | Implemented | Force provider refresh   |
| GET    | `/portfolios/`    | Implemented  | List portfolios (auth)          |
| GET    | `/alerts/`        | Implemented  | List alerts (auth)            |
| POST   | `/alerts/`        | Implemented  | Create alert (auth)             |

Full endpoint reference: [docs/api.md](docs/api.md)

## Roadmap

1. Add Recharts visualizations with full loaded price series from `/prices`.
2. Implement CSV/PDF report generation with richer templates.
3. Add news sentiment integration and UI overlays.
4. Production deployment configuration (TLS, managed DB, secrets management).
5. Refresh-token or session rotation for long-lived clients.
