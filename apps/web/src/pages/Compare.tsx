import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Compare() {
  return (
    <div>
      <PageHeader
        title="Compare Assets"
        description="Side-by-side comparison of stocks and ETFs."
      />
      <EmptyState
        title="No comparison configured"
        description="Select two or more assets to compare performance, volatility, and dip frequency."
      />
    </div>
  );
}
