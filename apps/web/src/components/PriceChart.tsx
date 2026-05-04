import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DipEvent } from "@/types/analysis";

interface PriceChartProps {
  events: DipEvent[];
}

export default function PriceChart({ events }: PriceChartProps) {
  if (events.length === 0) return null;

  const data = events.map((e) => ({
    date: e.date,
    price: e.price,
    rollingHigh: e.rolling_high,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="rollingHigh"
            stroke="#94a3b8"
            dot={false}
            strokeDasharray="4 2"
            name="Rolling High"
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#1d6ef1"
            strokeWidth={2}
            dot={{ r: 4, fill: "#1d6ef1" }}
            name="Dip Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
