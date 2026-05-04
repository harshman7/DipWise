import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function Watchlist() {
  return (
    <div>
      <PageHeader
        title="Watchlist"
        description="Keep an eye on assets you're interested in."
      />
      <EmptyState
        title="Your watchlist is empty"
        description="Add assets to track their price movements and get dip notifications."
      />
    </div>
  );
}
