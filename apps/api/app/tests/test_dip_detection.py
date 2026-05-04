from datetime import date, timedelta

import pandas as pd

from app.services.dip_detection_service import detect_dips_from_prices


def test_detect_dips_rolling_high_first_of_episode():
    dates = [date(2024, 1, 1) + timedelta(days=i) for i in range(120)]
    prices = []
    for i, d in enumerate(dates):
        px = 100.0 + float(i) * 0.1
        if i == 80:
            px = 85.0
        prices.append(px)

    df = pd.DataFrame(
        {
            "date": dates,
            "open": prices,
            "high": prices,
            "low": prices,
            "close": prices,
            "adj_close": prices,
            "volume": [1_000_000] * len(dates),
        }
    )

    events = detect_dips_from_prices(
        df,
        start_date=dates[20],
        end_date=dates[-1],
        lookback_days=20,
        dip_threshold=0.1,
        holding_period_days=[5],
    )
    assert len(events) >= 1
    assert events[0].drawdown_pct >= 10.0


def test_detect_dips_empty_when_insufficient_warmup():
    df = pd.DataFrame(
        {
            "date": [date(2024, 1, 1), date(2024, 1, 2)],
            "adj_close": [100.0, 99.0],
        }
    )
    ev = detect_dips_from_prices(
        df,
        start_date=date(2024, 1, 1),
        end_date=date(2024, 1, 2),
        lookback_days=90,
        dip_threshold=0.05,
    )
    assert ev == []
