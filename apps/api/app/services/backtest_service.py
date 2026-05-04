"""Simulate buy-the-dip strategies and compare against DCA baseline."""

import pandas as pd

from app.schemas.backtest import (
    DipAnalysisRequest,
    DipAnalysisResponse,
    DipEvent,
    HoldingPeriodSummary,
)
from app.services.dip_detection_service import detect_dips_from_prices, extended_fetch_start
from app.services.market_data_service import fetch_adjusted_prices


def simulate_buy_the_dip(request: DipAnalysisRequest) -> DipAnalysisResponse:
    ext_start = extended_fetch_start(request.start_date, request.lookback_days)
    df = fetch_adjusted_prices(
        request.symbol.upper().strip(), ext_start, request.end_date
    )
    if df.empty:
        return DipAnalysisResponse(
            symbol=request.symbol.upper().strip(),
            start_date=request.start_date,
            end_date=request.end_date,
            dip_threshold=request.dip_threshold,
            total_dips_detected=0,
            total_invested=0.0,
            strategy_value=0.0,
            strategy_return_pct=0.0,
            dca_return_pct=0.0,
            holding_period_summaries=[],
            dip_events=[],
        )

    events = detect_dips_from_prices(
        df,
        request.start_date,
        request.end_date,
        request.lookback_days,
        request.dip_threshold,
        request.holding_period_days,
    )

    df_win = df.copy()
    df_win["date"] = pd.to_datetime(df_win["date"]).dt.date
    df_win = df_win.sort_values("date").reset_index(drop=True)
    mask = (df_win["date"] >= request.start_date) & (df_win["date"] <= request.end_date)
    df_win = df_win.loc[mask].reset_index(drop=True)

    if df_win.empty:
        last_close = float(df["adj_close"].iloc[-1])
    else:
        last_close = float(df_win["adj_close"].iloc[-1])

    strategy_shares = 0.0
    total_invested = 0.0
    dip_dates = {e.date for e in events}
    for e in events:
        total_invested += request.investment_amount
        if e.price > 0:
            strategy_shares += request.investment_amount / e.price

    strategy_value = strategy_shares * last_close
    strategy_return_pct = (
        (strategy_value - total_invested) / total_invested * 100 if total_invested else 0.0
    )

    dca_return_pct = _compute_dca_return_pct(
        df_win,
        total_budget=total_invested,
        last_close=last_close,
    )

    summaries = _build_holding_period_summaries(events, request.holding_period_days)

    return DipAnalysisResponse(
        symbol=request.symbol.upper().strip(),
        start_date=request.start_date,
        end_date=request.end_date,
        dip_threshold=request.dip_threshold,
        total_dips_detected=len(events),
        total_invested=round(total_invested, 2),
        strategy_value=round(strategy_value, 2),
        strategy_return_pct=round(strategy_return_pct, 2),
        dca_return_pct=round(dca_return_pct, 2),
        holding_period_summaries=summaries,
        dip_events=events,
    )


def compare_to_dca(
    strategy_return_pct: float,
    dca_return_pct: float,
) -> dict[str, float]:
    return {
        "strategy_return_pct": strategy_return_pct,
        "dca_return_pct": dca_return_pct,
        "excess_return_pct": round(strategy_return_pct - dca_return_pct, 2),
    }


def _compute_dca_return_pct(
    df_window: pd.DataFrame,
    total_budget: float,
    last_close: float,
) -> float:
    """Evenly spread total_budget across each trading day in df_window."""
    if total_budget <= 0 or df_window.empty or last_close <= 0:
        return 0.0
    n = len(df_window)
    per_day = total_budget / n
    shares = 0.0
    for _, row in df_window.iterrows():
        px = float(row["adj_close"])
        if px > 0:
            shares += per_day / px
    dca_value = shares * last_close
    return (dca_value - total_budget) / total_budget * 100


def _build_holding_period_summaries(
    events: list[DipEvent],
    holding_periods: list[int],
) -> list[HoldingPeriodSummary]:
    summaries: list[HoldingPeriodSummary] = []
    for hp in holding_periods:
        key = f"{hp}d"
        returns = [e.returns[key] for e in events if key in e.returns]
        if not returns:
            continue
        sorted_r = sorted(returns)
        median = sorted_r[len(sorted_r) // 2]
        summaries.append(
            HoldingPeriodSummary(
                period_days=hp,
                avg_return_pct=round(sum(returns) / len(returns), 2),
                median_return_pct=round(median, 2),
                win_rate_pct=round(sum(1 for r in returns if r > 0) / len(returns) * 100, 1),
                best_return_pct=max(returns),
                worst_return_pct=min(returns),
            )
        )
    return summaries
