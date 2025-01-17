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

### 2026-06-28
- **Pytest service coverage:** Listed modules under `apps/api/app/tests` and what each file guards.
- Touched journal, changelog, README log line, and `CONTRIBUTING.md`.

### 2026-07-07
- **Vitest auth smoke:** Described `RequireAuth` tests and public route bypass cases.
- Touched journal, changelog, README log line, and `.env.example`.

### 2026-07-16
- **Docker compose topology:** Sketched api/web/postgres/redis/worker/beat/migrate service relationships.
- Touched journal, changelog, README log line, and `docs/architecture.md`.

### 2026-07-25
- **Market data providers:** Compared Yahoo default vs Polygon/Alpha Vantage key requirements.
- Touched journal, changelog, README log line, and `docs/api.md`.

### 2026-08-03
- **News optional surface:** Clarified bearer requirement and UI gating on backtester headlines.
- Touched journal, changelog, README log line, and `docs/data-model.md`.

### 2026-08-12
- **PostgreSQL schema map:** Cross-referenced ERD entities to router ownership boundaries.
- Touched journal, changelog, README log line, and `docs/testing-notes.md`.

### 2026-08-21
- **Tailwind brand palette:** Noted custom `brand` scale usage in layout and cards.
- Touched journal, changelog, README log line, and `CONTRIBUTING.md`.

### 2026-08-30
- **TanStack Query patterns:** Documented cache keys used on dashboard and analysis pages.
- Touched journal, changelog, README log line, and `.env.example`.

### 2026-09-08
- **Recharts brush zoom:** Captured backtester chart brush behavior and dip marker layering.
- Touched journal, changelog, README log line, and `docs/architecture.md`.

### 2026-09-17
- **Popular tickers constant:** Explained curated list purpose for quick symbol entry.
- Touched journal, changelog, README log line, and `docs/api.md`.

### 2026-09-26
- **Error handling copy:** Drafted user-facing helper text for empty states and loading.
- Touched journal, changelog, README log line, and `docs/data-model.md`.

### 2026-10-05
- **API pagination gaps:** Logged known limitations for list endpoints in roadmap notes.
- Touched journal, changelog, README log line, and `docs/testing-notes.md`.

### 2026-10-14
- **Environment templates:** Expanded `.env.example` commentary for local vs container hostnames.
- Touched journal, changelog, README log line, and `CONTRIBUTING.md`.

### 2026-10-23
- **Release hygiene:** Final pass tying journal, changelog, and architecture revision footers together.
- Touched journal, changelog, README log line, and `.env.example`.

### 2024-08-30
- **news integration (pass 1):** Captured QA checklist items for news integration. Pass 1/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-09-03
- **Celery workers (pass 2):** Expanded sandbox notes on Celery workers. Pass 2/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-09-04
- **OpenAPI codegen (pass 3):** Aligned changelog entries with OpenAPI codegen. Pass 3/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-09-14
- **compare charts (pass 4):** Recorded follow-ups for compare charts. Pass 4/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-09-16
- **moving averages (pass 5):** Cross-linked README sections with moving averages. Pass 5/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-09-19
- **dip detection (pass 6):** Documented edge cases and defaults for dip detection. Pass 6/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-10-02
- **Recharts tooling (pass 7):** Cross-linked README sections with Recharts tooling. Pass 7/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-10-04
- **data model (pass 8):** Recorded follow-ups for data model. Pass 8/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-10-11
- **saved backtests (pass 9):** Captured QA checklist items for saved backtests. Pass 9/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-10-12
- **dip detection (pass 10):** Expanded sandbox notes on dip detection. Pass 10/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-10-18
- **SMA/EMA indicators (pass 11):** Captured QA checklist items for SMA/EMA indicators. Pass 11/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-10-26
- **Celery workers (pass 12):** Aligned changelog entries with Celery workers. Pass 12/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-11-19
- **data model (pass 13):** Recorded follow-ups for data model. Pass 13/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-11-22
- **moving averages (pass 14):** Expanded sandbox notes on moving averages. Pass 14/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-11-28
- **alert evaluation (pass 15):** Documented edge cases and defaults for alert evaluation. Pass 15/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-12-09
- **report exports (pass 16):** Aligned changelog entries with report exports. Pass 16/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-12-20
- **data model (pass 17):** Recorded follow-ups for data model. Pass 17/100 in the sandbox documentation sweep; no runtime code changed.

### 2024-12-25
- **SMA/EMA indicators (pass 18):** Captured QA checklist items for SMA/EMA indicators. Pass 18/100 in the sandbox documentation sweep; no runtime code changed.

### 2025-01-05
- **dip detection (pass 19):** Captured QA checklist items for dip detection. Pass 19/100 in the sandbox documentation sweep; no runtime code changed.

### 2025-01-06
- **auth routing (pass 20):** Annotated developer workflow around auth routing. Pass 20/100 in the sandbox documentation sweep; no runtime code changed.

### 2025-01-11
- **testing strategy (pass 21):** Captured QA checklist items for testing strategy. Pass 21/100 in the sandbox documentation sweep; no runtime code changed.

### 2025-01-15
- **TanStack Query (pass 22):** Added revision footers covering TanStack Query. Pass 22/100 in the sandbox documentation sweep; no runtime code changed.

### 2025-01-17
- **Celery workers (pass 23):** Annotated developer workflow around Celery workers. Pass 23/100 in the sandbox documentation sweep; no runtime code changed.
