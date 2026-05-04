import Card from "./ui/Card";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  positive?: boolean;
  interactive?: boolean;
}

export default function MetricCard({
  label,
  value,
  sub,
  positive,
  interactive = true,
}: MetricCardProps) {
  return (
    <Card interactive={interactive} className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span
        className={`text-2xl font-bold ${positive === undefined ? "text-gray-900" : positive ? "text-emerald-600" : "text-red-600"}`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </Card>
  );
}
