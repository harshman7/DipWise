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
  /** Full-series adjusted close from `/prices` for the same window. */
  fullPrices?: { date: string; adj_close: number }[];
}

export default function PriceChart({ events, fullPrices }: PriceChartProps) {
  if (events.length === 0 && (!fullPrices || fullPrices.length === 0)) {
    return null;
  }

  const eventByDate = new Map(events.map((e) => [e.date, e]));
  const dates = new Set<string>();
  fullPrices?.forEach((p) => dates.add(p.date));
  events.forEach((e) => dates.add(e.date));
  const sortedDates = Array.from(dates).sort();

  const data = sortedDates.map((date) => {
    const ev = eventByDate.get(date);
    const fp = fullPrices?.find((p) => p.date === date);
    return {
      date,
      adjClose: fp?.adj_close,
      rollingHigh: ev?.rolling_high,
      dipPrice: ev?.price,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          {fullPrices && fullPrices.length > 0 && (
            <Line
              type="monotone"
              dataKey="adjClose"
              stroke="#cbd5e1"
              dot={false}
              strokeWidth={1.5}
              name="Adj. close"
              connectNulls
            />
          )}
          <Line
            type="monotone"
            dataKey="rollingHigh"
            stroke="#94a3b8"
            dot={false}
            strokeDasharray="4 2"
            name="Rolling High"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="dipPrice"
            stroke="#1d6ef1"
            strokeWidth={2}
            connectNulls
            dot={{ r: 4, fill: "#1d6ef1" }}
            name="Dip Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
