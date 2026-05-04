import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getPricesPricesSymbolGet, type PriceBar } from "@dipwise/shared";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/LoadingState";
import { POPULAR_TICKERS } from "@/constants/popularTickers";

const MAX_SYMBOLS = 6;

const MA_PERIOD_OPTIONS = [20, 50, 100, 200] as const;

function lastSmaValue(last: PriceBar, period: number): number | null {
  const fromMap = last.sma_by_period?.[String(period)];
  if (fromMap != null && fromMap > 0) return fromMap;
  if (period === 100 && last.sma_100 != null && last.sma_100 > 0) return last.sma_100;
  return null;
}

function lastEmaValue(last: PriceBar, period: number): number | null {
  const fromMap = last.ema_by_period?.[String(period)];
  if (fromMap != null && fromMap > 0) return fromMap;
  if (period === 100 && last.ema_100 != null && last.ema_100 > 0) return last.ema_100;
  return null;
}

function dedupeSymbols(rows: string[]): string[] {
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

type FetchSpec = { id: number; symbols: string[]; start: string; end: string; period: number };

type TableRow = {
  symbol: string;
  date: string | null;
  adjClose: number | null;
  sma100: number | null;
  ema100: number | null;
  vsSmaPct: number | null;
  error: string | null;
};

export default function MovingAverages() {
  const [symbolRows, setSymbolRows] = useState<string[]>(["VOO", "QQQ", "IWM"]);
  const [maPeriod, setMaPeriod] = useState<number>(100);
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [fetchSpec, setFetchSpec] = useState<FetchSpec | null>(null);

  const activeSymbols = useMemo(() => dedupeSymbols(symbolRows), [symbolRows]);

  const priceQueries = useQueries({
    queries:
      fetchSpec?.symbols.map((sym) => ({
        queryKey: [
          "ma-overview",
          fetchSpec.id,
          sym,
          fetchSpec.start,
          fetchSpec.end,
          fetchSpec.period,
        ] as const,
        enabled: !!fetchSpec && fetchSpec.symbols.length >= 1,
        queryFn: async () => {
          const p = fetchSpec.period;
          const r = await getPricesPricesSymbolGet(sym, {
            start: fetchSpec.start,
            end: fetchSpec.end,
            sma_periods: [p],
            ema_periods: [p],
          });
          if (r.status !== 200) throw new Error(`${sym}: could not load prices`);
          return { symbol: sym, prices: r.data.prices };
        },
      })) ?? [],
  });

  const loading =
    !!fetchSpec &&
    fetchSpec.symbols.length > 0 &&
    priceQueries.some((q) => q.isPending || q.isFetching);

  const rows: TableRow[] = useMemo(() => {
    if (!fetchSpec || !priceQueries.length) return [];
    return priceQueries.map((q): TableRow => {
      const sym =
        q.data?.symbol ?? (fetchSpec ? fetchSpec.symbols[priceQueries.indexOf(q)] : "?");
      if (q.isError) {
        return {
          symbol: sym,
          date: null,
          adjClose: null,
          sma100: null,
          ema100: null,
          vsSmaPct: null,
          error: "Load failed",
        };
      }
      if (!q.isSuccess || !q.data?.prices?.length) {
        return {
          symbol: sym,
          date: null,
          adjClose: null,
          sma100: null,
          ema100: null,
          vsSmaPct: null,
          error: q.isPending ? "…" : "No data",
        };
      }
      const pts = q.data.prices;
      const last = pts[pts.length - 1];
      const smaVal = lastSmaValue(last, fetchSpec.period);
      let vsSma: number | null = null;
      if (smaVal != null && smaVal > 0) {
        vsSma = ((last.adj_close / smaVal) - 1) * 100;
      }
      return {
        symbol: q.data.symbol,
        date: last.date,
        adjClose: last.adj_close,
        sma100: smaVal,
        ema100: lastEmaValue(last, fetchSpec.period),
        vsSmaPct: vsSma,
        error: null,
      };
    });
  }, [fetchSpec, priceQueries]);

  const updateRow = (index: number, value: string) => {
    setSymbolRows((prev) => {
      const next = [...prev];
      next[index] = value.toUpperCase();
      return next;
    });
  };

  return (
    <div>
      <PageHeader
        title="Moving averages"
        description="Configurable SMA and EMA period vs adjusted close for up to six tickers."
      />

      <Card className="mb-6">
        <p className="mb-3 text-xs text-gray-500">
          Enter tickers and a date range, then Load. Uses the same price feed as Compare and the
          backtester (with warmup for indicators).
        </p>
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
              {symbolRows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-600"
                  onClick={() =>
                    setSymbolRows((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setSymbolRows((prev) =>
                prev.length >= MAX_SYMBOLS ? prev : [...prev, ""],
              )
            }
            disabled={symbolRows.length >= MAX_SYMBOLS}
          >
            Add ticker
          </Button>
          <label className="text-sm text-gray-700">
            Quick add
            <select
              className="ml-2 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setSymbolRows((prev) => {
                  if (prev.some((r) => r.trim().toUpperCase() === v)) return prev;
                  const copy = [...prev];
                  const empty = copy.findIndex((r) => !r.trim());
                  if (empty >= 0) {
                    copy[empty] = v;
                    return copy;
                  }
                  if (copy.length < MAX_SYMBOLS) return [...copy, v];
                  return copy;
                });
              }}
            >
              <option value="">—</option>
              {POPULAR_TICKERS.slice(0, 20).map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </label>
          <Input label="Start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input label="End" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <label className="text-sm text-gray-700">
            SMA / EMA period (days)
            <select
              className="ml-2 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
              value={maPeriod}
              onChange={(e) => setMaPeriod(Number(e.target.value))}
            >
              {MA_PERIOD_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            onClick={() => {
              const syms = dedupeSymbols(symbolRows);
              if (syms.length < 1) return;
              setFetchSpec((p) => ({
                id: (p?.id ?? 0) + 1,
                symbols: syms,
                start,
                end,
                period: maPeriod,
              }));
            }}
            disabled={activeSymbols.length < 1}
          >
            Load
          </Button>
        </div>
      </Card>

      {loading && <LoadingState message="Loading…" />}

      {fetchSpec && !loading && rows.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-3 font-medium">Symbol</th>
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Adj. close</th>
                  <th className="pb-2 pr-3 font-medium">SMA {fetchSpec.period}</th>
                  <th className="pb-2 pr-3 font-medium">EMA {fetchSpec.period}</th>
                  <th className="pb-2 font-medium">% vs SMA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.symbol} className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-medium text-gray-900">{r.symbol}</td>
                    <td className="py-2 pr-3 text-gray-600">
                      {r.error ?? r.date ?? "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {r.adjClose != null ? r.adjClose.toFixed(2) : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {r.sma100 != null ? r.sma100.toFixed(2) : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {r.ema100 != null ? r.ema100.toFixed(2) : "—"}
                    </td>
                    <td className="py-2">
                      {r.vsSmaPct != null
                        ? `${r.vsSmaPct >= 0 ? "+" : ""}${r.vsSmaPct.toFixed(2)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
