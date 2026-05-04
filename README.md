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
packages/shared/   Shared TypeScript types
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
| `MARKET_DATA_API_KEY` | External market data provider API key        | (empty — uses mock data)   |
| `NEWS_API_KEY`        | News provider API key                        | (empty — uses mock data)   |
| `VITE_API_BASE_URL`   | Backend API URL for the frontend             | `http://localhost:8000`    |

## API Overview

| Method | Path              | Status       | Description                     |
|--------|-------------------|--------------|---------------------------------|
| GET    | `/health`         | Implemented  | Service health check            |
| POST   | `/analysis/dips`  | Implemented  | Dip detection + backtest (mock) |
| POST   | `/reports/dips/csv` | Implemented | CSV export of dip analysis      |
| POST   | `/auth/register`  | Stub         | User registration               |
| POST   | `/auth/login`     | Stub         | User authentication             |
| GET    | `/assets/`        | Stub         | List tracked assets             |
| GET    | `/prices/{symbol}`| Stub         | Historical prices               |
| GET    | `/portfolios/`    | Stub         | List portfolios                 |
| GET    | `/alerts/`        | Stub         | List alerts                     |

Full endpoint reference: [docs/api.md](docs/api.md)

## Roadmap

1. Integrate real market data provider (Yahoo Finance / Polygon / Alpha Vantage).
2. Implement JWT authentication flow (register, login, protected routes).
3. Build real dip detection with pandas rolling window analysis.
4. Wire Celery background tasks for alert checking and data ingestion.
5. Generate OpenAPI client in `packages/shared` for type-safe frontend API calls.
6. Add Recharts visualizations with real price series.
7. Implement CSV/PDF report generation with actual data.
8. Add news sentiment integration.
9. Production deployment configuration (TLS, managed DB, secrets management).
