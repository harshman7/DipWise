import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import MetricCard from "@/components/MetricCard";

const quickLinks = [
  { to: "/backtester", label: "Dip Backtester", desc: "Backtest buy-the-dip strategies" },
  { to: "/compare", label: "Compare Assets", desc: "Side-by-side stock / ETF analysis" },
  { to: "/moving-averages", label: "Moving Averages", desc: "SMA / EMA snapshot table" },
  { to: "/portfolio", label: "Portfolio", desc: "Track your holdings" },
  { to: "/alerts", label: "Alerts", desc: "Get notified on dips" },
];

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to DipWise — your investment analytics toolkit."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Tracked Assets" value="—" sub="Connect a data source" />
        <MetricCard label="Active Alerts" value="0" />
        <MetricCard label="Backtests Run" value="0" />
        <MetricCard label="Portfolios" value="0" />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            <Card className="hover:border-brand-300 hover:shadow transition-all cursor-pointer">
              <h3 className="font-semibold text-gray-900">{link.label}</h3>
              <p className="mt-1 text-xs text-gray-500">{link.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
