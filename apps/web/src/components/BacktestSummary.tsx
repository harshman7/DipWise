import type { DipAnalysisResponse } from "@/types/analysis";
import MetricCard from "./MetricCard";

interface BacktestSummaryProps {
  data: DipAnalysisResponse;
}

export default function BacktestSummary({ data }: BacktestSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <MetricCard label="Dips Detected" value={data.total_dips_detected} />
      <MetricCard
        label="Total Invested"
        value={`$${data.total_invested.toLocaleString()}`}
      />
      <MetricCard
        label="Strategy Return"
        value={`${data.strategy_return_pct.toFixed(1)}%`}
        positive={data.strategy_return_pct >= 0}
      />
      <MetricCard
        label="DCA Baseline"
        value={`${data.dca_return_pct.toFixed(1)}%`}
        positive={data.dca_return_pct >= 0}
        sub={`Excess: ${(data.strategy_return_pct - data.dca_return_pct).toFixed(1)}%`}
      />
    </div>
  );
}
