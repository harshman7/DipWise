import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Reports() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Export CSV and PDF reports for your analyses."
      />
      <EmptyState
        title="No reports generated"
        description="Run a backtest first, then export the results as CSV or PDF."
      />
    </div>
  );
}
