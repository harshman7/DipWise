"""Simulate buy-the-dip strategies and compare against DCA baseline.

Currently uses the mock dip events from dip_detection_service; once real data
is wired, this will run against actual historical prices.
"""

from app.schemas.backtest import (
    DipAnalysisRequest,
    DipAnalysisResponse,
    DipEvent,
    HoldingPeriodSummary,
)
from app.services.dip_detection_service import detect_dips


def simulate_buy_the_dip(request: DipAnalysisRequest) -> DipAnalysisResponse:
    events = detect_dips(
        symbol=request.symbol,
        start_date=request.start_date,
        end_date=request.end_date,
        lookback_days=request.lookback_days,
        dip_threshold=request.dip_threshold,
        holding_period_days=request.holding_period_days,
    )

    total_invested = request.investment_amount * len(events)
    strategy_return = _mock_strategy_return(events, request.investment_amount)
    strategy_value = total_invested * (1 + strategy_return / 100)
    dca_return = round(strategy_return * 0.72, 2)  # mock DCA underperformance

    summaries = _build_holding_period_summaries(events, request.holding_period_days)

    return DipAnalysisResponse(
        symbol=request.symbol,
        start_date=request.start_date,
        end_date=request.end_date,
        dip_threshold=request.dip_threshold,
        total_dips_detected=len(events),
        total_invested=round(total_invested, 2),
        strategy_value=round(strategy_value, 2),
        strategy_return_pct=round(strategy_return, 2),
        dca_return_pct=dca_return,
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


def _mock_strategy_return(events: list[DipEvent], amount: float) -> float:
    if not events:
        return 0.0
    avg_drawdown = sum(e.drawdown_pct for e in events) / len(events)
    return round(avg_drawdown * 1.8, 2)


def _build_holding_period_summaries(
    events: list[DipEvent],
    holding_periods: list[int],
) -> list[HoldingPeriodSummary]:
    summaries: list[HoldingPeriodSummary] = []
    for hp in holding_periods:
        key = f"{hp}d"
        returns = [e.returns.get(key, 0.0) for e in events]
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
