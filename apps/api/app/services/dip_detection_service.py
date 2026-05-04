"""Detect price dips relative to a rolling high using pandas."""

from datetime import date, timedelta

import pandas as pd

from app.schemas.backtest import DipEvent


def detect_dips_from_prices(
    prices: pd.DataFrame,
    start_date: date,
    end_date: date,
    lookback_days: int,
    dip_threshold: float,
    holding_period_days: list[int] | None = None,
) -> list[DipEvent]:
    """
    prices must be sorted ascending by date, include warmup rows before start_date
    so rolling_high is valid for the first in-window row.
    Columns: date, adj_close (and others ignored here).
    """
    holding_period_days = holding_period_days or [30, 90, 365, 730]
    if prices.empty or len(prices) < lookback_days + 1:
        return []

    df = prices.copy()
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df.sort_values("date").reset_index(drop=True)
    close = df["adj_close"].astype(float)
    rolling_high = close.rolling(window=lookback_days, min_periods=lookback_days).max()
    drawdown = 1.0 - close / rolling_high
    dip = drawdown >= dip_threshold
    first_of_episode = dip & ~(dip.shift(1, fill_value=False))
    in_window = (df["date"] >= start_date) & (df["date"] <= end_date)
    candidate_idx = df.index[first_of_episode & in_window].tolist()

    events: list[DipEvent] = []
    for idx in candidate_idx:
        d = df.at[idx, "date"]
        price = float(close.iloc[idx])
        rh = float(rolling_high.iloc[idx])
        dd_pct = float(drawdown.iloc[idx] * 100)

        returns: dict[str, float] = {}
        for hp in holding_period_days:
            j = idx + hp
            if j < len(df):
                future = float(close.iloc[j])
                ret_pct = (future - price) / price * 100
                returns[f"{hp}d"] = round(ret_pct, 2)

        events.append(
            DipEvent(
                date=d,
                price=round(price, 4),
                rolling_high=round(rh, 4),
                drawdown_pct=round(dd_pct, 2),
                returns=returns,
            )
        )

    return events


def extended_fetch_start(start_date: date, lookback_days: int) -> date:
    """Calendar cushion before start for lookback warmup (not exact trading days)."""
    extra = max(lookback_days * 2, 400)
    return start_date - timedelta(days=extra)
