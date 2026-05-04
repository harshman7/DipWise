import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Portfolio() {
  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Track your holdings and performance."
      />
      <EmptyState
        title="No portfolios yet"
        description="Create a portfolio to start tracking positions and transactions."
      />
    </div>
  );
}
