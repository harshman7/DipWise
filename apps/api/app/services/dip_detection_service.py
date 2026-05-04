"""Detect price dips relative to a rolling high.

Placeholder implementation that generates deterministic mock dip events
so the API returns realistic-looking data before a real data source is wired.
"""

import hashlib
from datetime import date, timedelta

from app.schemas.backtest import DipEvent


def _seed_from(symbol: str, start: date, end: date) -> int:
    raw = f"{symbol}{start}{end}"
    return int(hashlib.md5(raw.encode()).hexdigest(), 16) % (10**9)


def detect_dips(
    symbol: str,
    start_date: date,
    end_date: date,
    lookback_days: int = 90,
    dip_threshold: float = 0.05,
    holding_period_days: list[int] | None = None,
) -> list[DipEvent]:
    """Return mock dip events spread across the date range."""
    holding_period_days = holding_period_days or [30, 90, 365, 730]
    seed = _seed_from(symbol, start_date, end_date)
    total_days = (end_date - start_date).days
    if total_days <= 0:
        return []

    num_dips = max(3, (total_days // 120) + (seed % 4))
    step = total_days // (num_dips + 1)

    events: list[DipEvent] = []
    base_price = 300.0 + (seed % 200)

    for i in range(num_dips):
        dip_date = start_date + timedelta(days=step * (i + 1))
        drawdown = dip_threshold + ((seed >> (i * 3)) % 15) / 100.0
        rolling_high = base_price + (i * 10) + ((seed >> i) % 40)
        price = round(rolling_high * (1 - drawdown), 2)

        returns: dict[str, float] = {}
        for hp in holding_period_days:
            ret_pct = round(drawdown * 100 * (0.4 + hp / 365) + ((seed >> hp) % 8) - 3, 2)
            returns[f"{hp}d"] = ret_pct

        events.append(
            DipEvent(
                date=dip_date,
                price=price,
                rolling_high=round(rolling_high, 2),
                drawdown_pct=round(drawdown * 100, 2),
                returns=returns,
            )
        )

    return events
