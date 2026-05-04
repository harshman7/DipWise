import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
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
import { POPULAR_TICKERS } from "@/constants/popularTickers";

const MAX_SYMBOL_ROWS = 6;

const LINE_COLORS = [
  "#1d6ef1",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#64748b",
];

type FetchSpec = {
  id: number;
  symbols: string[];
  start: string;
  end: string;
};

function normalizeSeries(prices: PriceListResponse["prices"]) {
  if (!prices.length) return [];
  const first = prices[0].adj_close;
  if (!first) return [];
  return prices.map((p) => ({
    date: p.date,
    n: (p.adj_close / first) * 100,
  }));
}

/** Outer join on union of dates; missing series keys omitted for that row. */
function mergeManyNormalized(
  seriesList: { label: string; points: { date: string; n: number }[] }[],
): Record<string, string | number | undefined>[] {
  const map = new Map<string, Record<string, string | number | undefined>>();
  for (const { label, points } of seriesList) {
    for (const pt of points) {
      const row = map.get(pt.date) ?? { date: pt.date };
      row[label] = pt.n;
      map.set(pt.date, row);
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );
}

function dedupeSymbolsForFetch(rows: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    const s = r.trim().toUpperCase();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export default function Compare() {
  const [symbolRows, setSymbolRows] = useState<string[]>([
    "VOO",
    "QQQ",
    "IWM",
  ]);
  const [start, setStart] = useState("2021-01-01");
  const [end, setEnd] = useState("2025-01-01");
  const [fetchSpec, setFetchSpec] = useState<FetchSpec | null>(null);
  const [popularQuick, setPopularQuick] = useState("");

  const activeSymbols = useMemo(
    () => dedupeSymbolsForFetch(symbolRows),
    [symbolRows],
  );

  const priceQueries = useQueries({
    queries:
      fetchSpec?.symbols.map((sym) => ({
        queryKey: [
          "compare-prices",
          fetchSpec.id,
          sym,
          fetchSpec.start,
          fetchSpec.end,
        ] as const,
        enabled: !!fetchSpec && fetchSpec.symbols.length >= 1,
        queryFn: async () => {
          const r = await getPricesPricesSymbolGet(sym, {
            start: fetchSpec.start,
            end: fetchSpec.end,
          });
          if (r.status !== 200) {
            throw new Error(`${sym}: could not load prices`);
          }
          return { symbol: sym, prices: r.data.prices };
        },
      })) ?? [],
  });

  const loading =
    !!fetchSpec &&
    fetchSpec.symbols.length > 0 &&
    priceQueries.some((q) => q.isPending || q.isFetching);

  const failedQueries = priceQueries.filter((q) => q.isError);
  const failureMessages = failedQueries.map((q) =>
    q.error instanceof Error ? q.error.message : "Unknown error",
  );

  const loadedSymbols = fetchSpec?.symbols ?? [];

  const chartData = useMemo(() => {
    if (!fetchSpec || loadedSymbols.length === 0) return [];
    if (priceQueries.length !== loadedSymbols.length) return [];
    if (!priceQueries.every((q) => q.isSuccess && q.data?.prices?.length)) {
      return [];
    }
    const seriesList = priceQueries.map((q) => ({
      label: q.data!.symbol,
      points: normalizeSeries(q.data!.prices),
    }));
    if (seriesList.some((s) => !s.points.length)) return [];
    return mergeManyNormalized(seriesList);
  }, [fetchSpec, loadedSymbols.length, priceQueries]);

  const allFetchedOk =
    !!fetchSpec &&
    loadedSymbols.length > 0 &&
    priceQueries.length === loadedSymbols.length &&
    priceQueries.every((q) => q.isSuccess);

  const updateRow = (index: number, value: string) => {
    setSymbolRows((prev) => {
      const next = [...prev];
      next[index] = value.toUpperCase();
      return next;
    });
  };

  const removeRow = (index: number) => {
    setSymbolRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const addRow = () => {
    setSymbolRows((prev) => {
      if (prev.length >= MAX_SYMBOL_ROWS) return prev;
      return [...prev, ""];
    });
  };

  const applyPopularQuickAdd = (raw: string) => {
    if (!raw) return;
    const sym = raw.toUpperCase();
    setSymbolRows((prev) => {
      const already = prev.some((r) => r.trim().toUpperCase() === sym);
      if (already) return prev;
      const rows = [...prev];
      const emptyIdx = rows.findIndex((r) => !r.trim());
      if (emptyIdx >= 0) {
        rows[emptyIdx] = sym;
        return rows;
      }
      if (rows.length < MAX_SYMBOL_ROWS) {
        return [...rows, sym];
      }
      return prev;
    });
    setPopularQuick("");
  };

  const handleLoad = () => {
    const syms = dedupeSymbolsForFetch(symbolRows);
    if (syms.length < 1) return;
    setFetchSpec((prev) => ({
      id: (prev?.id ?? 0) + 1,
      symbols: syms,
      start,
      end,
    }));
  };

  return (
    <div>
      <PageHeader
        title="Compare Assets"
        description="Normalized total return (rebased to 100) from daily adjusted closes. Add up to six tickers."
      />

      <Card className="mb-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-xs text-gray-500">
            Each row is one ticker. Duplicates are ignored when loading. Maximum{" "}
            {MAX_SYMBOL_ROWS} symbols. Click Load after changing tickers or
            dates.
          </p>
          <div className="flex flex-col gap-1 sm:w-72">
            <label className="text-sm font-medium text-gray-700">
              Quick add (popular)
            </label>
            <select
              value={popularQuick}
              onChange={(e) => {
                const v = e.target.value;
                if (v) applyPopularQuickAdd(v);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Choose to add…</option>
              {POPULAR_TICKERS.map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol} — {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-2 text-sm font-medium text-gray-700">Tickers</p>
        <div className="space-y-2">
          {symbolRows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Input
                  label=""
                  placeholder="SYMBOL"
                  value={row}
                  onChange={(e) => updateRow(index, e.target.value)}
                  aria-label={`Ticker ${index + 1}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-red-600 hover:text-red-700"
                disabled={symbolRows.length <= 1}
                onClick={() => removeRow(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addRow}
            disabled={symbolRows.length >= MAX_SYMBOL_ROWS}
          >
            Add ticker
          </Button>
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
          <Button
            type="button"
            onClick={handleLoad}
            disabled={activeSymbols.length < 1}
          >
            Load
          </Button>
        </div>
        {activeSymbols.length < 1 && (
          <p className="mt-2 text-sm text-amber-700">
            Enter at least one ticker to load the chart.
          </p>
        )}
      </Card>

      {loading && <LoadingState message="Loading prices..." />}

      {failureMessages.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50 text-sm text-red-700">
          <p className="font-medium">Could not load some series:</p>
          <ul className="mt-1 list-inside list-disc">
            {failureMessages.map((msg, i) => (
              <li key={`${msg}-${i}`}>{msg}</li>
            ))}
          </ul>
        </Card>
      )}

      {fetchSpec &&
        allFetchedOk &&
        loadedSymbols.length > 0 &&
        chartData.length === 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50 text-sm text-amber-900">
            No overlapping chart data for this range. Try different dates or
            symbols.
          </Card>
        )}

      {fetchSpec &&
        chartData.length > 0 &&
        !loading &&
        failureMessages.length === 0 && (
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Normalized performance
            </h2>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Legend />
                  {loadedSymbols.map((sym, i) => (
                    <Line
                      key={sym}
                      type="monotone"
                      dataKey={sym}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      dot={false}
                      strokeWidth={2}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
    </div>
  );
}
