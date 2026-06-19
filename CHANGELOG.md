# Changelog

## [Unreleased]


### 2026-02-04
- **Dip detection baselines:** Documented rolling-high lookback defaults and how threshold fractions map to UI percent inputs.
- Touched journal, changelog, README log line, and `docs/architecture.md`.

### 2026-02-13
- **Backtester holding periods:** Aligned preset chips (30/90/180/365/730) with API `holding_period_days` validation notes.
- Touched journal, changelog, README log line, and `docs/api.md`.

### 2026-02-22
- **Compare chart overlays:** Captured rebasing rules for normalized performance and optional SMA/EMA overlays.
- Touched journal, changelog, README log line, and `docs/data-model.md`.

### 2026-03-03
- **Moving averages table:** Specified column semantics for last bar, configurable periods, and % distance vs SMA.
- Touched journal, changelog, README log line, and `docs/testing-notes.md`.

### 2026-03-12
- **Price ingestion staleness:** Described `PRICE_STALE_DAYS` refresh behavior and provider fallback order.
- Touched journal, changelog, README log line, and `CONTRIBUTING.md`.

### 2026-03-21
- **Indicator warmup windows:** Explained warmup history loaded before `start` for valid SMA/EMA on first in-range bar.
- Touched journal, changelog, README log line, and `.env.example`.

### 2026-03-30
- **Alert types matrix:** Tabulated dip_threshold vs price_below vs sma_cross evaluation cadence.
- Touched journal, changelog, README log line, and `docs/architecture.md`.

### 2026-04-08
- **SMA cross params JSON:** Documented Alembic `002` `params_json` shape for cross direction and period.
- Touched journal, changelog, README log line, and `docs/api.md`.

### 2026-04-17
- **Celery beat schedules:** Recorded ingest (30m) and alert check (10m) intervals for local Docker stacks.
- Touched journal, changelog, README log line, and `docs/data-model.md`.

### 2026-04-26
- **JWT client storage:** Noted `dipwise_token` localStorage contract used by generated client.
- Touched journal, changelog, README log line, and `docs/testing-notes.md`.

### 2026-05-05
- **RequireAuth routing:** Mapped public vs protected routes for smoke tests and onboarding copy.
- Touched journal, changelog, README log line, and `CONTRIBUTING.md`.

### 2026-05-14
- **Saved backtests API:** Outlined persistence fields returned to the backtester save action.
- Touched journal, changelog, README log line, and `.env.example`.

### 2026-05-23
- **Reports CSV/PDF:** Linked export endpoints to shared `DipAnalysisRequest` body schema.
- Touched journal, changelog, README log line, and `docs/architecture.md`.

### 2026-06-01
- **Watchlist CRUD flows:** Summarized authenticated watchlist endpoints and UI expectations.
- Touched journal, changelog, README log line, and `docs/api.md`.

### 2026-06-10
- **Portfolio transactions:** Documented transaction POST/GET paths and position rollups.
- Touched journal, changelog, README log line, and `docs/data-model.md`.

### 2026-06-19
- **OpenAPI codegen loop:** Captured `npm run codegen:api` steps and Orval output location.
- Touched journal, changelog, README log line, and `docs/testing-notes.md`.
