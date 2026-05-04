import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPricesPricesSymbolGet,
  type PriceListResponse,
} from "@dipwise/shared";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/LoadingState";

function normalizeSeries(prices: PriceListResponse["prices"]) {
  if (!prices.length) return [];
  const first = prices[0].adj_close;
  if (!first) return [];
  return prices.map((p) => ({
    date: p.date,
    n: (p.adj_close / first) * 100,
  }));
}

function mergeNormalized(
  a: { date: string; n: number }[],
  b: { date: string; n: number }[],
  labelA: string,
  labelB: string,
) {
  const map = new Map<string, Record<string, string | number>>();
  for (const row of a) {
    map.set(row.date, { date: row.date, [labelA]: row.n });
  }
  for (const row of b) {
    const cur = map.get(row.date) ?? { date: row.date };
    cur[labelB] = row.n;
    map.set(row.date, cur);
  }
  return Array.from(map.values()).sort((x, y) =>
    String(x.date).localeCompare(String(y.date)),
  );
}

export default function Compare() {
  const [symA, setSymA] = useState("VOO");
  const [symB, setSymB] = useState("QQQ");
  const [start, setStart] = useState("2021-01-01");
  const [end, setEnd] = useState("2025-01-01");
  const [run, setRun] = useState(false);

  const params = useMemo(() => ({ start, end }), [start, end]);

  const qA = useQuery({
    queryKey: ["compare", symA, params],
    enabled: run && !!symA.trim(),
    queryFn: async () => {
      const r = await getPricesPricesSymbolGet(symA.trim().toUpperCase(), params);
      if (r.status !== 200) throw new Error("Failed to load series A");
      return r.data;
    },
  });

  const qB = useQuery({
    queryKey: ["compare", symB, params],
    enabled: run && !!symB.trim(),
    queryFn: async () => {
      const r = await getPricesPricesSymbolGet(symB.trim().toUpperCase(), params);
      if (r.status !== 200) throw new Error("Failed to load series B");
      return r.data;
    },
  });

  const chartData = useMemo(() => {
    if (!qA.data?.prices?.length || !qB.data?.prices?.length) return [];
    const na = normalizeSeries(qA.data.prices);
    const nb = normalizeSeries(qB.data.prices);
    const la = symA.trim().toUpperCase();
    const lb = symB.trim().toUpperCase();
    return mergeNormalized(na, nb, la, lb);
  }, [qA.data, qB.data, symA, symB]);

  const loading = qA.isFetching || qB.isFetching;
  const err = qA.error ?? qB.error;

  return (
    <div>
      <PageHeader
        title="Compare Assets"
        description="Normalized total return (rebased to 100) from daily adjusted closes."
      />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Symbol A"
            value={symA}
            onChange={(e) => setSymA(e.target.value.toUpperCase())}
          />
          <Input
            label="Symbol B"
            value={symB}
            onChange={(e) => setSymB(e.target.value.toUpperCase())}
          />
          <Input
            label="Start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <Input
            label="End"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <div className="flex items-end">
            <Button type="button" className="w-full" onClick={() => setRun(true)}>
              Load
            </Button>
          </div>
        </div>
      </Card>

      {loading && <LoadingState message="Loading prices..." />}

      {err && (
        <Card className="mb-6 border-red-200 bg-red-50 text-sm text-red-700">
          {(err as Error).message}
        </Card>
      )}

      {run && chartData.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Normalized performance
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={symA.trim().toUpperCase()}
                  stroke="#1d6ef1"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey={symB.trim().toUpperCase()}
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
