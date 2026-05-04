"""Fetch historical price data from Yahoo Finance, Polygon, or Alpha Vantage."""

from datetime import date, timedelta
from typing import Any

import httpx
import pandas as pd

from app.core.config import settings


_EXPECTED_COLS = ["date", "open", "high", "low", "close", "adj_close", "volume"]


def _empty_df() -> pd.DataFrame:
    return pd.DataFrame(columns=_EXPECTED_COLS)


def _normalize_df(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return _empty_df()
    out = df.copy()
    if "date" not in out.columns and isinstance(out.index, pd.DatetimeIndex):
        out = out.reset_index()
        # yfinance often names column 'Date' or first col is date
        date_col = next(
            (c for c in out.columns if str(c).lower() in ("date", "datetime")),
            out.columns[0],
        )
        out = out.rename(columns={date_col: "date"})
    out["date"] = pd.to_datetime(out["date"]).dt.date
    for col in ("open", "high", "low", "close", "adj_close"):
        if col not in out.columns:
            if col == "adj_close" and "close" in out.columns:
                out["adj_close"] = out["close"]
            else:
                out[col] = float("nan")
    if "volume" not in out.columns:
        out["volume"] = 0
    out = out[[c for c in _EXPECTED_COLS if c in out.columns]]
    for c in _EXPECTED_COLS:
        if c not in out.columns:
            out[c] = float("nan") if c != "volume" else 0
    out = out[_EXPECTED_COLS]
    out = out.dropna(subset=["adj_close"])
    out = out.sort_values("date").reset_index(drop=True)
    return out


def _fetch_yahoo(symbol: str, start: date, end: date) -> pd.DataFrame:
    import yfinance as yf

    # yfinance end is exclusive for some versions; add one day
    end_eff = end + timedelta(days=1)
    raw = yf.download(
        symbol,
        start=start.isoformat(),
        end=end_eff.isoformat(),
        progress=False,
        auto_adjust=False,
        threads=False,
    )
    if raw.empty:
        return _empty_df()
    df = raw.copy()
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [str(c[0]).strip() for c in df.columns.values]
    rename_map = {
        "Open": "open",
        "High": "high",
        "Low": "low",
        "Close": "close",
        "Adj Close": "adj_close",
        "Volume": "volume",
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})
    if "adj_close" not in df.columns and "close" in df.columns:
        df["adj_close"] = df["close"]
    df = df.reset_index()
    dcol = "Date" if "Date" in df.columns else df.columns[0]
    df = df.rename(columns={dcol: "date"})
    return _normalize_df(df)


def _fetch_polygon(symbol: str, start: date, end: date) -> pd.DataFrame:
    key = settings.MARKET_DATA_API_KEY
    if not key:
        return _empty_df()
    sym = symbol.upper()
    url = f"https://api.polygon.io/v2/aggs/ticker/{sym}/range/1/day/{start.isoformat()}/{end.isoformat()}"
    rows: list[dict[str, Any]] = []
    with httpx.Client(timeout=60.0) as client:
        params = {"adjusted": "true", "sort": "asc", "limit": 50000, "apiKey": key}
        r = client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
        rows = data.get("results") or []
    if not rows:
        return _empty_df()
    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["t"], unit="ms").dt.date
    df = df.rename(
        columns={
            "o": "open",
            "h": "high",
            "l": "low",
            "c": "close",
            "v": "volume",
        }
    )
    df["adj_close"] = df["close"]
    return _normalize_df(df)


def _fetch_alpha_vantage(symbol: str, start: date, end: date) -> pd.DataFrame:
    key = settings.MARKET_DATA_API_KEY
    if not key:
        return _empty_df()
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_DAILY_ADJUSTED",
        "symbol": symbol.upper(),
        "outputsize": "full",
        "apikey": key,
    }
    with httpx.Client(timeout=60.0) as client:
        r = client.get(url, params=params)
        r.raise_for_status()
        payload = r.json()
    series = payload.get("Time Series (Daily)") or {}
    if not series:
        return _empty_df()
    records = []
    for dstr, ohlc in sorted(series.items()):
        d = date.fromisoformat(dstr)
        if d < start or d > end:
            continue
        records.append(
            {
                "date": d,
                "open": float(ohlc["1. open"]),
                "high": float(ohlc["2. high"]),
                "low": float(ohlc["3. low"]),
                "close": float(ohlc["4. close"]),
                "adj_close": float(ohlc.get("5. adjusted close", ohlc["4. close"])),
                "volume": int(float(ohlc["6. volume"])),
            }
        )
    return _normalize_df(pd.DataFrame(records))


def fetch_adjusted_prices(symbol: str, start: date, end: date) -> pd.DataFrame:
    """Return a DataFrame with columns: date, open, high, low, close, adj_close, volume."""
    provider = settings.MARKET_DATA_PROVIDER
    if provider == "polygon":
        return _fetch_polygon(symbol, start, end)
    if provider == "alphavantage":
        return _fetch_alpha_vantage(symbol, start, end)
    return _fetch_yahoo(symbol, start, end)
