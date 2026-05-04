import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPricesPricesSymbolGet, newsForSymbolNewsSymbolGet } from "@dipwise/shared";
import { postAnalysisDips } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { DipAnalysisRequest, DipAnalysisResponse } from "@/types/analysis";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/LoadingState";
import BacktestSummary from "@/components/BacktestSummary";
import DipEventsTable from "@/components/DipEventsTable";
import PriceChart from "@/components/PriceChart";
import { POPULAR_TICKERS } from "@/constants/popularTickers";

const HOLDING_PRESETS = [30, 90, 180, 365, 730] as const;

const schema = z.object({
  symbol: z.string().min(1, "Required").toUpperCase(),
  start_date: z.string().min(1, "Required"),
  end_date: z.string().min(1, "Required"),
  dip_threshold_pct: z.coerce.number().min(1).max(50),
  investment_amount: z.coerce.number().positive(),
  lookback_days: z.coerce.number().int().min(5).max(365),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  symbol: "VOO",
  start_date: "2021-01-01",
  end_date: "2026-01-01",
  dip_threshold_pct: 5,
  investment_amount: 200,
  lookback_days: 90,
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">{children}</p>;
}

export default function DipBacktester() {
  const { token } = useAuth();
  const [result, setResult] = useState<DipAnalysisResponse | null>(null);
  const [holdingPeriods, setHoldingPeriods] = useState<number[]>([
    30, 90, 180, 365, 730,
  ]);
  const [selectedHolding, setSelectedHolding] = useState<number[]>([
    ...HOLDING_PRESETS,
  ]);

  const [popularSearch, setPopularSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const symbolValue = watch("symbol");

  const filteredPopular = useMemo(() => {
    const q = popularSearch.trim().toLowerCase();
    if (!q) return POPULAR_TICKERS;
    return POPULAR_TICKERS.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q),
    );
  }, [popularSearch]);

  const popularSelectValue = POPULAR_TICKERS.some(
    (t) => t.symbol === symbolValue?.toUpperCase(),
  )
    ? symbolValue.toUpperCase()
    : "";

  const mutation = useMutation({
    mutationFn: (req: DipAnalysisRequest) => postAnalysisDips(req),
    onSuccess: (data, variables) => {
      setResult(data);
      setHoldingPeriods(
        variables.holding_period_days?.length
          ? variables.holding_period_days
          : [...HOLDING_PRESETS],
      );
    },
  });

  const toggleHolding = (days: number) => {
    setSelectedHolding((prev) => {
      if (prev.includes(days)) {
        if (prev.length <= 1) return prev;
        return prev.filter((d) => d !== days);
      }
      return [...prev, days].sort((a, b) => a - b);
    });
  };

  const onSubmit = (values: FormValues) => {
    const holding_period_days = [...selectedHolding].sort((a, b) => a - b);
    const req: DipAnalysisRequest = {
      symbol: values.symbol,
      start_date: values.start_date,
      end_date: values.end_date,
      dip_threshold: values.dip_threshold_pct / 100,
      investment_amount: values.investment_amount,
      lookback_days: values.lookback_days,
      holding_period_days,
    };
    mutation.mutate(req);
  };

  const priceQuery = useQuery({
    queryKey: [
      "backtester-prices",
      result?.symbol,
      result?.start_date,
      result?.end_date,
      "sma100",
    ],
    enabled: !!result,
    queryFn: async () => {
      const r = await getPricesPricesSymbolGet(result!.symbol, {
        start: String(result!.start_date),
        end: String(result!.end_date),
        sma_periods: [100],
      });
      if (r.status !== 200) throw new Error("Could not load prices");
      return r.data;
    },
  });

  const latestSmaInsight = useMemo(() => {
    const prices = priceQuery.data?.prices;
    if (!prices?.length) return null;
    for (let i = prices.length - 1; i >= 0; i--) {
      const p = prices[i];
      const sma = p.sma_100;
      if (sma != null && sma > 0) {
        const vs = ((p.adj_close / sma) - 1) * 100;
        return {
          date: p.date,
          adjClose: p.adj_close,
          sma,
          vsSmaPct: vs,
        };
      }
    }
    return null;
  }, [priceQuery.data?.prices]);

  const newsQuery = useQuery({
    queryKey: ["backtester-news", result?.symbol, token],
    enabled: !!result && !!token,
    queryFn: async () => {
      const r = await newsForSymbolNewsSymbolGet(result!.symbol);
      if (r.status !== 200) throw new Error("News failed");
      return r.data;
    },
  });

  const fullPrices =
    priceQuery.data?.prices.map((p) => ({
      date: p.date,
      adj_close: p.adj_close,
      sma_100: p.sma_100,
    })) ?? undefined;

  const fieldClass = "text-[15px] leading-snug";

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Dip Backtester"
        description="Simulate buying after drawdowns from a rolling high and compare returns to dollar-cost averaging."
      />

      <Card className="mb-8 border-gray-100/80 shadow-sm">
        <div className="mb-6 border-b border-gray-100 pb-5">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Configure your run
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-gray-600">
            We flag dips when price falls by your threshold from the highest close in the lookback
            window, then measure hypothetical returns if you bought on those dates and held for each
            horizon you select.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-0">
            <div className="space-y-8">
              <div className="rounded-2xl bg-slate-50/90 p-5 ring-1 ring-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ticker
                </p>
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
                    <div className="min-w-0 flex flex-col gap-1.5">
                      <label
                        htmlFor="popular-search"
                        className="text-sm font-medium text-gray-800"
                      >
                        Search popular
                      </label>
                      <input
                        id="popular-search"
                        type="search"
                        autoComplete="off"
                        placeholder="Type symbol or company…"
                        value={popularSearch}
                        onChange={(e) => setPopularSearch(e.target.value)}
                        className="h-11 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3.5 text-[15px] shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      <FieldHint>
                        Filters the list beside it. Results stay on this device only.
                      </FieldHint>
                    </div>
                    <div className="min-w-0 flex flex-col gap-1.5">
                      <label
                        htmlFor="popular-select"
                        className="text-sm font-medium text-gray-800"
                      >
                        Popular tickers
                      </label>
                      <select
                        id="popular-select"
                        value={popularSelectValue}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) {
                            setValue("symbol", v, { shouldValidate: true });
                          }
                        }}
                        className="h-11 w-full min-w-0 max-w-full rounded-xl border border-gray-200 bg-white px-3.5 text-[15px] shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="">Choose a ticker…</option>
                        {filteredPopular.map((t) => (
                          <option key={t.symbol} value={t.symbol}>
                            {t.symbol} — {t.name}
                          </option>
                        ))}
                      </select>
                      {filteredPopular.length === 0 && (
                        <p className="text-xs text-gray-500">No matches — try another query.</p>
                      )}
                    </div>
                  </div>
                  <div className="w-full min-w-0">
                    <Input
                      label="Symbol (any ticker)"
                      placeholder="e.g. VOO"
                      className={fieldClass}
                      {...register("symbol", {
                        setValueAs: (v) =>
                          typeof v === "string" ? v.trim().toUpperCase() : v,
                      })}
                      error={errors.symbol?.message}
                    />
                    <FieldHint>
                      Used for price history and backtest; use any symbol your data source supports.
                    </FieldHint>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">Sample range</p>
                <FieldHint>
                  Only trading days in this window are considered. Wider ranges need more history for
                  lookback and moving averages.
                </FieldHint>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Start date"
                    type="date"
                    {...register("start_date")}
                    error={errors.start_date?.message}
                  />
                  <Input
                    label="End date"
                    type="date"
                    {...register("end_date")}
                    error={errors.end_date?.message}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">Dip threshold (%)</p>
                <FieldHint>
                  Drawdown from the rolling high (see lookback) required to count as a dip. 5% means
                  price is at most 95% of that high.
                </FieldHint>
                <div className="mt-3 max-w-xs">
                  <Input
                    label="Threshold"
                    type="number"
                    min={1}
                    max={50}
                    step={1}
                    {...register("dip_threshold_pct")}
                    error={errors.dip_threshold_pct?.message}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">Lookback window (days)</p>
                <FieldHint>
                  Number of prior calendar days used to define the rolling high before each day. A
                  larger window makes dips rarer but often deeper.
                </FieldHint>
                <div className="mt-3 max-w-xs">
                  <Input
                    label="Days"
                    type="number"
                    {...register("lookback_days")}
                    error={errors.lookback_days?.message}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">Holding periods</p>
                <FieldHint>
                  After each simulated buy, we measure return at these horizons (trading days).
                  Toggle one or more; at least one must stay selected.
                </FieldHint>
                <div className="mt-3 flex flex-wrap gap-2">
                  {HOLDING_PRESETS.map((d) => {
                    const active = selectedHolding.includes(d);
                    const onlyOne = selectedHolding.length === 1 && active;
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={onlyOne}
                        onClick={() => toggleHolding(d)}
                        className={clsx(
                          "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                          active
                            ? "border-brand-600 bg-brand-50 text-brand-800 shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                          onlyOne && "cursor-not-allowed opacity-90",
                        )}
                      >
                        {d}d
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-800">Investment per dip</p>
                <FieldHint>Fixed dollar amount allocated on each detected dip event.</FieldHint>
                <div className="mt-3 max-w-xs">
                  <Input
                    label="Amount ($)"
                    type="number"
                    {...register("investment_amount")}
                    error={errors.investment_amount?.message}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-between border-t border-gray-100 pt-8 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-5">
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">Ready</p>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                  Results show summary metrics, an interactive price chart with dips and a 100-day
                  SMA, and a per-event table. Use the chart brush to focus a date range.
                </p>
              </div>
              <div className="lg:mt-10">
                <Button type="submit" disabled={mutation.isPending} className="h-12 w-full lg:max-w-sm">
                  {mutation.isPending ? "Analyzing…" : "Run backtest"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      {mutation.isPending && <LoadingState message="Running backtest…" />}

      {mutation.isError && (
        <Card
          interactive
          className="mb-6 border-red-200/80 bg-red-50/80 text-sm text-red-800"
        >
          Error: {(mutation.error as Error).message}
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <BacktestSummary data={result} />
          {priceQuery.isLoading && (
            <LoadingState message="Loading price history for chart…" />
          )}
          <Card interactive>
            <h2 className="mb-3 text-sm font-semibold text-gray-800">
              Prices, dips, rolling high, and 100-day SMA
            </h2>
            <PriceChart events={result.dip_events} fullPrices={fullPrices} />
            {latestSmaInsight && (
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Latest in range</span>
                {" · "}
                Adj. close {latestSmaInsight.adjClose.toFixed(2)} vs 100-day SMA{" "}
                {latestSmaInsight.sma.toFixed(2)}
                {" · "}
                {latestSmaInsight.vsSmaPct >= 0 ? "+" : ""}
                {latestSmaInsight.vsSmaPct.toFixed(2)}% vs SMA
                <span className="text-gray-400"> ({latestSmaInsight.date})</span>
              </p>
            )}
          </Card>
          {token && newsQuery.data && (
            <Card interactive>
              <h2 className="mb-3 text-sm font-semibold text-gray-800">
                Headlines ({result.symbol})
              </h2>
              {newsQuery.data.provider_note && (
                <p className="mb-2 text-xs text-amber-700">
                  {newsQuery.data.provider_note}
                </p>
              )}
              <ul className="space-y-2 text-sm">
                {newsQuery.data.articles.length === 0 ? (
                  <li className="text-gray-500">No articles returned.</li>
                ) : (
                  newsQuery.data.articles.map((a) => (
                    <li key={a.url} className="border-b border-gray-100 pb-2">
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {a.headline}
                      </a>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {a.source ?? "News"}{" "}
                        · {new Date(a.published_at).toLocaleString()}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          )}
          {!token && (
            <Card
              interactive
              className="border-dashed border-gray-200 bg-slate-50 text-sm text-gray-600"
            >
              Sign in to see news headlines for this symbol on this page.
            </Card>
          )}
          <Card interactive>
            <h2 className="mb-3 text-sm font-semibold text-gray-800">Dip events</h2>
            <DipEventsTable
              events={result.dip_events}
              holdingPeriods={holdingPeriods}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
