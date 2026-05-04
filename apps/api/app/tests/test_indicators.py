from datetime import date, timedelta

import numpy as np
import pandas as pd

from app.services.indicator_service import (
    add_exponential_moving_averages,
    add_simple_moving_averages,
)


def test_sma_100_first_valid_row_is_mean_of_prior_100_closes():
    dates = [date(2024, 1, 1) + timedelta(days=i) for i in range(150)]
    closes = [float(i + 1) for i in range(150)]
    df = pd.DataFrame(
        {
            "date": dates,
            "adj_close": closes,
        }
    )
    out = add_simple_moving_averages(df, [100])
    assert np.isnan(out.loc[0:98, "sma_100"]).all()
    expected = sum(closes[0:100]) / 100.0
    assert abs(out.loc[99, "sma_100"] - expected) < 1e-9
    expected2 = sum(closes[1:101]) / 100.0
    assert abs(out.loc[100, "sma_100"] - expected2) < 1e-9


def test_sma_multiple_periods():
    dates = [date(2024, 1, 1) + timedelta(days=i) for i in range(20)]
    closes = [10.0] * 20
    df = pd.DataFrame({"date": dates, "adj_close": closes})
    out = add_simple_moving_averages(df, [5, 10])
    assert abs(out.loc[4, "sma_5"] - 10.0) < 1e-9
    assert np.isnan(out.loc[3, "sma_5"])
    assert abs(out.loc[9, "sma_10"] - 10.0) < 1e-9


def test_ema_constant_series_equals_close():
    dates = [date(2024, 1, 1) + timedelta(days=i) for i in range(30)]
    closes = [10.0] * 30
    df = pd.DataFrame({"date": dates, "adj_close": closes})
    out = add_exponential_moving_averages(df, [100])
    assert (out["ema_100"] - 10.0).abs().max() < 1e-9


def test_ema_linear_series_first_row_defined():
    dates = [date(2024, 1, 1) + timedelta(days=i) for i in range(5)]
    closes = [100.0, 101.0, 102.0, 103.0, 104.0]
    df = pd.DataFrame({"date": dates, "adj_close": closes})
    out = add_exponential_moving_averages(df, [3])
    assert not np.isnan(out.loc[0, "ema_3"])
    assert out.loc[4, "ema_3"] > out.loc[0, "ema_3"]
