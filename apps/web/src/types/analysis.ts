export interface DipAnalysisRequest {
  symbol: string;
  start_date: string;
  end_date: string;
  dip_threshold: number;
  investment_amount: number;
  lookback_days: number;
  holding_period_days: number[];
}

export interface DipEvent {
  date: string;
  price: number;
  rolling_high: number;
  drawdown_pct: number;
  returns: Record<string, number>;
}

export interface HoldingPeriodSummary {
  period_days: number;
  avg_return_pct: number;
  median_return_pct: number;
  win_rate_pct: number;
  best_return_pct: number;
  worst_return_pct: number;
}

export interface DipAnalysisResponse {
  symbol: string;
  start_date: string;
  end_date: string;
  dip_threshold: number;
  total_dips_detected: number;
  total_invested: number;
  strategy_value: number;
  strategy_return_pct: number;
  dca_return_pct: number;
  holding_period_summaries: HoldingPeriodSummary[];
  dip_events: DipEvent[];
}
