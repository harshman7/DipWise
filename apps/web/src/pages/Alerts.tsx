import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Alerts() {
  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Configure price drop and dip threshold alerts."
      />
      <EmptyState
        title="No alerts configured"
        description="Set up alerts to get notified when an asset dips below your threshold."
      />
    </div>
  );
}
