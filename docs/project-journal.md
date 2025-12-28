# DipWise project journal

Non-production sandbox notes. Entries below track incremental documentation passes.


## 2026-02-04 — Dip detection baselines

Documented rolling-high lookback defaults and how threshold fractions map to UI percent inputs.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-02-04.
- Added revision footer in rotating doc set (index 0).


## 2026-02-13 — Backtester holding periods

Aligned preset chips (30/90/180/365/730) with API `holding_period_days` validation notes.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-02-13.
- Added revision footer in rotating doc set (index 1).


## 2026-02-22 — Compare chart overlays

Captured rebasing rules for normalized performance and optional SMA/EMA overlays.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-02-22.
- Added revision footer in rotating doc set (index 2).


## 2026-03-03 — Moving averages table

Specified column semantics for last bar, configurable periods, and % distance vs SMA.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-03-03.
- Added revision footer in rotating doc set (index 3).


## 2026-03-12 — Price ingestion staleness

Described `PRICE_STALE_DAYS` refresh behavior and provider fallback order.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-03-12.
- Added revision footer in rotating doc set (index 4).


## 2026-03-21 — Indicator warmup windows

Explained warmup history loaded before `start` for valid SMA/EMA on first in-range bar.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-03-21.
- Added revision footer in rotating doc set (index 5).


## 2026-03-30 — Alert types matrix

Tabulated dip_threshold vs price_below vs sma_cross evaluation cadence.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-03-30.
- Added revision footer in rotating doc set (index 0).


## 2026-04-08 — SMA cross params JSON

Documented Alembic `002` `params_json` shape for cross direction and period.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-04-08.
- Added revision footer in rotating doc set (index 1).


## 2026-04-17 — Celery beat schedules

Recorded ingest (30m) and alert check (10m) intervals for local Docker stacks.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-04-17.
- Added revision footer in rotating doc set (index 2).


## 2026-04-26 — JWT client storage

Noted `dipwise_token` localStorage contract used by generated client.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-04-26.
- Added revision footer in rotating doc set (index 3).


## 2026-05-05 — RequireAuth routing

Mapped public vs protected routes for smoke tests and onboarding copy.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-05-05.
- Added revision footer in rotating doc set (index 4).


## 2026-05-14 — Saved backtests API

Outlined persistence fields returned to the backtester save action.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-05-14.
- Added revision footer in rotating doc set (index 5).


## 2026-05-23 — Reports CSV/PDF

Linked export endpoints to shared `DipAnalysisRequest` body schema.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-05-23.
- Added revision footer in rotating doc set (index 0).


## 2026-06-01 — Watchlist CRUD flows

Summarized authenticated watchlist endpoints and UI expectations.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-06-01.
- Added revision footer in rotating doc set (index 1).


## 2026-06-10 — Portfolio transactions

Documented transaction POST/GET paths and position rollups.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-06-10.
- Added revision footer in rotating doc set (index 2).


## 2026-06-19 — OpenAPI codegen loop

Captured `npm run codegen:api` steps and Orval output location.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-06-19.
- Added revision footer in rotating doc set (index 3).


## 2026-06-28 — Pytest service coverage

Listed modules under `apps/api/app/tests` and what each file guards.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-06-28.
- Added revision footer in rotating doc set (index 4).


## 2026-07-07 — Vitest auth smoke

Described `RequireAuth` tests and public route bypass cases.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-07-07.
- Added revision footer in rotating doc set (index 5).


## 2026-07-16 — Docker compose topology

Sketched api/web/postgres/redis/worker/beat/migrate service relationships.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-07-16.
- Added revision footer in rotating doc set (index 0).


## 2026-07-25 — Market data providers

Compared Yahoo default vs Polygon/Alpha Vantage key requirements.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-07-25.
- Added revision footer in rotating doc set (index 1).


## 2026-08-03 — News optional surface

Clarified bearer requirement and UI gating on backtester headlines.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-08-03.
- Added revision footer in rotating doc set (index 2).


## 2026-08-12 — PostgreSQL schema map

Cross-referenced ERD entities to router ownership boundaries.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-08-12.
- Added revision footer in rotating doc set (index 3).


## 2026-08-21 — Tailwind brand palette

Noted custom `brand` scale usage in layout and cards.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-08-21.
- Added revision footer in rotating doc set (index 4).


## 2026-08-30 — TanStack Query patterns

Documented cache keys used on dashboard and analysis pages.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-08-30.
- Added revision footer in rotating doc set (index 5).


## 2026-09-08 — Recharts brush zoom

Captured backtester chart brush behavior and dip marker layering.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-09-08.
- Added revision footer in rotating doc set (index 0).


## 2026-09-17 — Popular tickers constant

Explained curated list purpose for quick symbol entry.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-09-17.
- Added revision footer in rotating doc set (index 1).


## 2026-09-26 — Error handling copy

Drafted user-facing helper text for empty states and loading.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-09-26.
- Added revision footer in rotating doc set (index 2).


## 2026-10-05 — API pagination gaps

Logged known limitations for list endpoints in roadmap notes.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-10-05.
- Added revision footer in rotating doc set (index 3).


## 2026-10-14 — Environment templates

Expanded `.env.example` commentary for local vs container hostnames.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-10-14.
- Added revision footer in rotating doc set (index 4).


## 2026-10-23 — Release hygiene

Final pass tying journal, changelog, and architecture revision footers together.

**Checks performed**

- Verified cross-links between README and `docs/`.
- Updated changelog entry for 2026-10-23.
- Added revision footer in rotating doc set (index 5).


## 2024-08-30 — news integration (pass 1)

Captured QA checklist items for news integration. Pass 1/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2024-09-03 — Celery workers (pass 2)

Expanded sandbox notes on Celery workers. Pass 2/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2024-09-04 — OpenAPI codegen (pass 3)

Aligned changelog entries with OpenAPI codegen. Pass 3/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2024-09-14 — compare charts (pass 4)

Recorded follow-ups for compare charts. Pass 4/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2024-09-16 — moving averages (pass 5)

Cross-linked README sections with moving averages. Pass 5/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2024-09-19 — dip detection (pass 6)

Documented edge cases and defaults for dip detection. Pass 6/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2024-09-19: consolidated pointer for dip detection.

## 2024-10-02 — Recharts tooling (pass 7)

Cross-linked README sections with Recharts tooling. Pass 7/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2024-10-04 — data model (pass 8)

Recorded follow-ups for data model. Pass 8/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2024-10-11 — saved backtests (pass 9)

Captured QA checklist items for saved backtests. Pass 9/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2024-10-12 — dip detection (pass 10)

Expanded sandbox notes on dip detection. Pass 10/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2024-10-18 — SMA/EMA indicators (pass 11)

Captured QA checklist items for SMA/EMA indicators. Pass 11/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2024-10-26 — Celery workers (pass 12)

Aligned changelog entries with Celery workers. Pass 12/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2024-11-19 — data model (pass 13)

Recorded follow-ups for data model. Pass 13/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2024-11-19: consolidated pointer for data model.

## 2024-11-22 — moving averages (pass 14)

Expanded sandbox notes on moving averages. Pass 14/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2024-11-28 — alert evaluation (pass 15)

Documented edge cases and defaults for alert evaluation. Pass 15/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2024-12-09 — report exports (pass 16)

Aligned changelog entries with report exports. Pass 16/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2024-12-20 — data model (pass 17)

Recorded follow-ups for data model. Pass 17/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2024-12-25 — SMA/EMA indicators (pass 18)

Captured QA checklist items for SMA/EMA indicators. Pass 18/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2025-01-05 — dip detection (pass 19)

Captured QA checklist items for dip detection. Pass 19/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2025-01-06 — auth routing (pass 20)

Annotated developer workflow around auth routing. Pass 20/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2025-01-06: consolidated pointer for auth routing.

## 2025-01-11 — testing strategy (pass 21)

Captured QA checklist items for testing strategy. Pass 21/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2025-01-15 — TanStack Query (pass 22)

Added revision footers covering TanStack Query. Pass 22/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2025-01-17 — Celery workers (pass 23)

Annotated developer workflow around Celery workers. Pass 23/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2025-01-22 — price ingestion (pass 24)

Cross-linked README sections with price ingestion. Pass 24/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2025-01-29 — news integration (pass 25)

Aligned changelog entries with news integration. Pass 25/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2025-03-08 — TanStack Query (pass 26)

Recorded follow-ups for TanStack Query. Pass 26/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2025-03-31 — backtester UX (pass 27)

Expanded sandbox notes on backtester UX. Pass 27/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2025-03-31: consolidated pointer for backtester UX.

## 2025-04-17 — testing strategy (pass 28)

Annotated developer workflow around testing strategy. Pass 28/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2025-05-14 — watchlist flows (pass 29)

Documented edge cases and defaults for watchlist flows. Pass 29/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2025-05-19 — TanStack Query (pass 30)

Captured QA checklist items for TanStack Query. Pass 30/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2025-05-23 — price ingestion (pass 31)

Aligned changelog entries with price ingestion. Pass 31/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2025-05-31 — price ingestion (pass 32)

Cross-linked README sections with price ingestion. Pass 32/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2025-06-02 — OpenAPI codegen (pass 33)

Recorded follow-ups for OpenAPI codegen. Pass 33/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2025-06-06 — Docker compose (pass 34)

Annotated developer workflow around Docker compose. Pass 34/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2025-06-06: consolidated pointer for Docker compose.

## 2025-06-08 — news integration (pass 35)

Recorded follow-ups for news integration. Pass 35/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2025-06-09 — TanStack Query (pass 36)

Cross-linked README sections with TanStack Query. Pass 36/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2025-06-13 — testing strategy (pass 37)

Documented edge cases and defaults for testing strategy. Pass 37/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2025-06-20 — Docker compose (pass 38)

Cross-linked README sections with Docker compose. Pass 38/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2025-06-22 — Recharts tooling (pass 39)

Captured QA checklist items for Recharts tooling. Pass 39/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2025-06-25 — Celery workers (pass 40)

Aligned changelog entries with Celery workers. Pass 40/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2025-07-13 — dip detection (pass 41)

Recorded follow-ups for dip detection. Pass 41/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2025-07-13: consolidated pointer for dip detection.

## 2025-07-23 — OpenAPI codegen (pass 42)

Annotated developer workflow around OpenAPI codegen. Pass 42/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2025-07-29 — Docker compose (pass 43)

Annotated developer workflow around Docker compose. Pass 43/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2025-08-05 — news integration (pass 44)

Documented edge cases and defaults for news integration. Pass 44/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2025-09-12 — portfolio flows (pass 45)

Aligned changelog entries with portfolio flows. Pass 45/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2025-09-22 — environment setup (pass 46)

Recorded follow-ups for environment setup. Pass 46/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2025-09-27 — saved backtests (pass 47)

Added revision footers covering saved backtests. Pass 47/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2025-09-29 — news integration (pass 48)

Documented edge cases and defaults for news integration. Pass 48/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2025-09-29: consolidated pointer for news integration.

## 2025-10-02 — alert evaluation (pass 49)

Aligned changelog entries with alert evaluation. Pass 49/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2025-10-09 — backtester UX (pass 50)

Aligned changelog entries with backtester UX. Pass 50/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2025-10-15 — saved backtests (pass 51)

Cross-linked README sections with saved backtests. Pass 51/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2025-11-01 — data model (pass 52)

Captured QA checklist items for data model. Pass 52/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2025-11-05 — Recharts tooling (pass 53)

Added revision footers covering Recharts tooling. Pass 53/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2025-11-12 — Docker compose (pass 54)

Captured QA checklist items for Docker compose. Pass 54/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2025-11-18 — API reference (pass 55)

Expanded sandbox notes on API reference. Pass 55/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2025-11-18: consolidated pointer for API reference.

## 2025-11-23 — alert evaluation (pass 56)

Aligned changelog entries with alert evaluation. Pass 56/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2025-11-25 — moving averages (pass 57)

Aligned changelog entries with moving averages. Pass 57/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2025-11-28 — dip detection (pass 58)

Recorded follow-ups for dip detection. Pass 58/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.


## 2025-12-03 — OpenAPI codegen (pass 59)

Aligned changelog entries with OpenAPI codegen. Pass 59/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/testing-notes.md`.


## 2025-12-10 — data model (pass 60)

Added revision footers covering data model. Pass 60/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `CONTRIBUTING.md`.


## 2025-12-13 — news integration (pass 61)

Cross-linked README sections with news integration. Pass 61/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `.env.example`.


## 2025-12-15 — moving averages (pass 62)

Aligned changelog entries with moving averages. Pass 62/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/project-journal.md`.


> Inline marker 2025-12-15: consolidated pointer for moving averages.

## 2025-12-21 — saved backtests (pass 63)

Cross-linked README sections with saved backtests. Pass 63/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/architecture.md`.


## 2025-12-22 — API reference (pass 64)

Aligned changelog entries with API reference. Pass 64/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/api.md`.


## 2025-12-28 — market data providers (pass 65)

Recorded follow-ups for market data providers. Pass 65/100 in the sandbox documentation sweep; no runtime code changed.

- Journal, changelog, and README log updated.
- Rotating doc: `docs/data-model.md`.

