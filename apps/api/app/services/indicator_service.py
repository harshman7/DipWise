"""Technical indicators on price series (pandas)."""

import pandas as pd


def add_simple_moving_averages(
    prices: pd.DataFrame,
    periods: list[int],
) -> pd.DataFrame:
    """
    Mutates a copy of `prices` sorted by date; expects `date` and `adj_close`.
    Adds columns `sma_{N}` for each N in periods (e.g. sma_100).
    Uses rolling mean with min_periods=N (first N-1 rows NaN for each series).
    """
    if not periods or prices.empty:
        return prices.copy()

    df = prices.copy()
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df.sort_values("date").reset_index(drop=True)
    close = df["adj_close"].astype(float)
    for n in sorted(set(p for p in periods if p > 0)):
        col = f"sma_{n}"
        df[col] = close.rolling(window=n, min_periods=n).mean()
    return df
