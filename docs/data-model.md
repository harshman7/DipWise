# Data Model

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ portfolios : owns
    users ||--o{ watchlists : owns
    users ||--o{ alerts : owns
    users ||--o{ saved_backtests : owns
    assets ||--o{ daily_prices : has
    assets ||--o{ portfolio_positions : "held in"
    assets ||--o{ watchlist_items : "tracked in"
    assets ||--o{ alerts : "monitored by"
    assets ||--o{ news_items : "mentioned in"
    portfolios ||--o{ portfolio_positions : contains
    portfolios ||--o{ portfolio_transactions : records
    watchlists ||--o{ watchlist_items : contains
    alerts ||--o{ alert_events : triggers
```

## Tables

### users
| Column          | Type           | Notes                    |
|-----------------|----------------|--------------------------|
| id              | integer PK     | Auto-increment           |
| email           | varchar(255)   | Unique, indexed          |
| hashed_password | varchar(255)   |                          |
| full_name       | varchar(255)   | Nullable                 |
| is_active       | boolean        | Default true             |
| created_at      | timestamptz    |                          |
| updated_at      | timestamptz    |                          |

### assets
| Column        | Type          | Notes                           |
|---------------|---------------|---------------------------------|
| id            | integer PK    |                                 |
| symbol        | varchar(20)   | Unique, indexed (e.g. VOO)      |
| name          | varchar(255)  |                                 |
| asset_type    | varchar(20)   | stock, etf, crypto              |
| exchange      | varchar(50)   | Nullable                        |
| metadata_json | jsonb         | Nullable, flexible extra fields |

### daily_prices
| Column    | Type          | Notes                               |
|-----------|---------------|-------------------------------------|
| id        | integer PK    |                                     |
| asset_id  | integer FK    | References assets.id, CASCADE       |
| date      | date          | Indexed; unique with asset_id       |
| open      | numeric(14,4) |                                     |
| high      | numeric(14,4) |                                     |
| low       | numeric(14,4) |                                     |
| close     | numeric(14,4) |                                     |
| adj_close | numeric(14,4) |                                     |
| volume    | integer       |                                     |

### portfolios
| Column      | Type         | Notes                      |
|-------------|--------------|----------------------------|
| id          | integer PK   |                            |
| user_id     | integer FK   | References users.id        |
| name        | varchar(255) |                            |
| description | text         | Nullable                   |
| created_at  | timestamptz  |                            |

### portfolio_positions
| Column         | Type           | Notes                      |
|----------------|----------------|----------------------------|
| id             | integer PK     |                            |
| portfolio_id   | integer FK     | References portfolios.id   |
| asset_id       | integer FK     | References assets.id       |
| shares         | numeric(16,6)  |                            |
| avg_cost_basis | numeric(14,4)  |                            |

### portfolio_transactions
| Column       | Type           | Notes                      |
|--------------|----------------|----------------------------|
| id           | integer PK     |                            |
| portfolio_id | integer FK     | References portfolios.id   |
| asset_id     | integer FK     | References assets.id       |
| tx_type      | varchar(10)    | buy or sell                |
| shares       | numeric(16,6)  |                            |
| price        | numeric(14,4)  |                            |
| executed_at  | timestamptz    |                            |

### watchlists
| Column     | Type         | Notes                |
|------------|--------------|----------------------|
| id         | integer PK   |                      |
| user_id    | integer FK   | References users.id  |
| name       | varchar(255) |                      |
| created_at | timestamptz  |                      |

### watchlist_items
| Column       | Type       | Notes                      |
|--------------|------------|----------------------------|
| id           | integer PK |                            |
| watchlist_id | integer FK | References watchlists.id   |
| asset_id     | integer FK | References assets.id       |

### alerts
| Column     | Type           | Notes                            |
|------------|----------------|----------------------------------|
| id         | integer PK     |                                  |
| user_id    | integer FK     | References users.id              |
| asset_id   | integer FK     | References assets.id             |
| alert_type | varchar(30)    | dip_threshold, price_below, etc. |
| threshold  | numeric(10,4)  |                                  |
| message    | text           | Nullable                         |
| is_active  | boolean        | Default true                     |
| created_at | timestamptz    |                                  |

### alert_events
| Column           | Type           | Notes                    |
|------------------|----------------|--------------------------|
| id               | integer PK     |                          |
| alert_id         | integer FK     | References alerts.id     |
| triggered_at     | timestamptz    |                          |
| price_at_trigger | numeric(14,4)  |                          |
| details          | text           | Nullable                 |

### saved_backtests
| Column     | Type        | Notes                    |
|------------|-------------|--------------------------|
| id         | integer PK  |                          |
| user_id    | integer FK  | References users.id      |
| symbol     | varchar(20) |                          |
| parameters | jsonb       | Input params snapshot    |
| results    | jsonb       | Full results snapshot    |
| created_at | timestamptz |                          |

### news_items
| Column          | Type           | Notes                        |
|-----------------|----------------|------------------------------|
| id              | integer PK     |                              |
| asset_id        | integer FK     | Nullable, References assets  |
| headline        | varchar(500)   |                              |
| url             | text           |                              |
| source          | varchar(100)   | Nullable                     |
| sentiment_score | numeric(5,4)   | Nullable, -1.0 to 1.0       |
| published_at    | timestamptz    |                              |
| fetched_at      | timestamptz    |                              |


<!-- revision 2026-02-22: Compare chart overlays -->
**2026-02-22 — Compare chart overlays.** Captured rebasing rules for normalized performance and optional SMA/EMA overlays.


<!-- revision 2026-04-17: Celery beat schedules -->
**2026-04-17 — Celery beat schedules.** Recorded ingest (30m) and alert check (10m) intervals for local Docker stacks.


<!-- revision 2026-06-10: Portfolio transactions -->
**2026-06-10 — Portfolio transactions.** Documented transaction POST/GET paths and position rollups.


<!-- revision 2026-08-03: News optional surface -->
**2026-08-03 — News optional surface.** Clarified bearer requirement and UI gating on backtester headlines.


<!-- revision 2026-09-26: Error handling copy -->
**2026-09-26 — Error handling copy.** Drafted user-facing helper text for empty states and loading.

<!-- 2024-09-03 pass 2: Celery workers -->
**2024-09-03** — Expanded sandbox notes on Celery workers. Pass 2/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2024-10-11 pass 9: saved backtests -->
**2024-10-11** — Captured QA checklist items for saved backtests. Pass 9/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2024-12-09 pass 16: report exports -->
**2024-12-09** — Aligned changelog entries with report exports. Pass 16/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-01-17 pass 23: Celery workers -->
**2025-01-17** — Annotated developer workflow around Celery workers. Pass 23/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-05-19 pass 30: TanStack Query -->
**2025-05-19** — Captured QA checklist items for TanStack Query. Pass 30/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-06-13 pass 37: testing strategy -->
**2025-06-13** — Documented edge cases and defaults for testing strategy. Pass 37/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-08-05 pass 44: news integration -->
**2025-08-05** — Documented edge cases and defaults for news integration. Pass 44/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-10-15 pass 51: saved backtests -->
**2025-10-15** — Cross-linked README sections with saved backtests. Pass 51/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-11-28 pass 58: dip detection -->
**2025-11-28** — Recorded follow-ups for dip detection. Pass 58/100 in the sandbox documentation sweep; no runtime code changed.

<!-- 2025-12-28 pass 65: market data providers -->
**2025-12-28** — Recorded follow-ups for market data providers. Pass 65/100 in the sandbox documentation sweep; no runtime code changed.
