from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class DipAnalysisRequest(BaseModel):
    symbol: str = Field(..., examples=["VOO"])
    start_date: date
    end_date: date
    dip_threshold: float = Field(0.05, ge=0.01, le=0.50)
    investment_amount: float = Field(200, gt=0)
    lookback_days: int = Field(90, ge=5, le=365)
    holding_period_days: list[int] = Field(default=[30, 90, 365, 730])


class DipEvent(BaseModel):
    date: date
    price: float
    rolling_high: float
    drawdown_pct: float
    returns: dict[str, float]


class HoldingPeriodSummary(BaseModel):
    period_days: int
    avg_return_pct: float
    median_return_pct: float
    win_rate_pct: float
    best_return_pct: float
    worst_return_pct: float


class DipAnalysisResponse(BaseModel):
    symbol: str
    start_date: date
    end_date: date
    dip_threshold: float
    total_dips_detected: int
    total_invested: float
    strategy_value: float
    strategy_return_pct: float
    dca_return_pct: float
    holding_period_summaries: list[HoldingPeriodSummary]
    dip_events: list[DipEvent]


class SavedBacktestCreate(BaseModel):
    symbol: str
    parameters: dict[str, Any]
    results: dict[str, Any]


class SavedBacktestResponse(BaseModel):
    id: int
    symbol: str
    parameters: dict[str, Any]
    results: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}
