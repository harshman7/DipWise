"""Fetch historical price data from external providers.

Currently a placeholder — returns an empty DataFrame. Wire up a real provider
(e.g. Yahoo Finance, Alpha Vantage, Polygon) by implementing fetch_adjusted_prices.
"""

from datetime import date

import pandas as pd


def fetch_adjusted_prices(
    symbol: str, start: date, end: date
) -> pd.DataFrame:
    """Return a DataFrame with columns: date, open, high, low, close, adj_close, volume."""
    # TODO: integrate real market data provider
    return pd.DataFrame(
        columns=["date", "open", "high", "low", "close", "adj_close", "volume"]
    )
