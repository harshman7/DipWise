import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
} from "recharts";
import type { DipEvent } from "@/types/analysis";

interface PriceChartProps {
  events: DipEvent[];
  /** Full-series adjusted close from `/prices` for the same window. */
  fullPrices?: {
    date: string;
    adj_close: number;
    sma_100?: number | null;
  }[];
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
      sma100: fp?.sma_100 ?? undefined,
      rollingHigh: ev?.rolling_high,
      dipPrice: ev?.price,
    };
  });

  return (
    <div className="min-h-[380px] w-full">
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
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
          {fullPrices?.some((p) => p.sma_100 != null) && (
            <Line
              type="monotone"
              dataKey="sma100"
              stroke="#a855f7"
              dot={false}
              strokeWidth={1.5}
              strokeDasharray="6 3"
              name="100-day SMA"
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
          <Brush
            dataKey="date"
            height={28}
            stroke="#94a3b8"
            fill="#f8fafc"
            travellerWidth={8}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-gray-500">
        Drag the range control below the chart to zoom the date window.
      </p>
    </div>
  );
}
