import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const schema = z.object({
  symbol: z.string().min(1, "Required").toUpperCase(),
  start_date: z.string().min(1, "Required"),
  end_date: z.string().min(1, "Required"),
  dip_threshold: z.coerce.number().min(0.01).max(0.5),
  investment_amount: z.coerce.number().positive(),
  lookback_days: z.coerce.number().int().min(5).max(365),
  holding_period_days: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  symbol: "VOO",
  start_date: "2021-01-01",
  end_date: "2026-01-01",
  dip_threshold: 0.05,
  investment_amount: 200,
  lookback_days: 90,
  holding_period_days: "30,90,365,730",
};

export default function DipBacktester() {
  const { token } = useAuth();
  const [result, setResult] = useState<DipAnalysisResponse | null>(null);
  const [holdingPeriods, setHoldingPeriods] = useState<number[]>([
    30, 90, 365, 730,
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
          : [30, 90, 365, 730],
      );
    },
  });

  const onSubmit = (values: FormValues) => {
    const req: DipAnalysisRequest = {
      ...values,
      holding_period_days: values.holding_period_days
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n)),
    };
    mutation.mutate(req);
  };

  const priceQuery = useQuery({
    queryKey: [
      "backtester-prices",
      result?.symbol,
      result?.start_date,
      result?.end_date,
    ],
    enabled: !!result,
    queryFn: async () => {
      const r = await getPricesPricesSymbolGet(result!.symbol, {
        start: String(result!.start_date),
        end: String(result!.end_date),
      });
      if (r.status !== 200) throw new Error("Could not load prices");
      return r.data;
    },
  });

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
    })) ?? undefined;

  return (
    <div>
      <PageHeader
        title="Dip Backtester"
        description="Detect historical price dips and backtest buy-the-dip strategies."
      />

      <Card className="mb-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-gray-100 bg-slate-50/80 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              Ticker
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="popular-search"
                  className="text-sm font-medium text-gray-700"
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
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="popular-select"
                  className="text-sm font-medium text-gray-700"
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
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Choose a ticker…</option>
                  {filteredPopular.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} — {t.name}
                    </option>
                  ))}
                </select>
                {filteredPopular.length === 0 && (
                  <p className="text-xs text-gray-500">No matches — type a symbol below.</p>
                )}
              </div>
              <Input
                label="Symbol (any ticker)"
                placeholder="e.g. VOO"
                {...register("symbol", {
                  setValueAs: (v) =>
                    typeof v === "string" ? v.trim().toUpperCase() : v,
                })}
                error={errors.symbol?.message}
              />
            </div>
          </div>
          <Input
            label="Start Date"
            type="date"
            {...register("start_date")}
            error={errors.start_date?.message}
          />
          <Input
            label="End Date"
            type="date"
            {...register("end_date")}
            error={errors.end_date?.message}
          />
          <Input
            label="Dip Threshold"
            type="number"
            step="0.01"
            {...register("dip_threshold")}
            error={errors.dip_threshold?.message}
          />
          <Input
            label="Investment Amount ($)"
            type="number"
            {...register("investment_amount")}
            error={errors.investment_amount?.message}
          />
          <Input
            label="Lookback Window (days)"
            type="number"
            {...register("lookback_days")}
            error={errors.lookback_days?.message}
          />
          <Input
            label="Holding Periods (comma-sep)"
            placeholder="30,90,365,730"
            {...register("holding_period_days")}
            error={errors.holding_period_days?.message}
          />
          <div className="flex items-end">
            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? "Analyzing..." : "Run Backtest"}
            </Button>
          </div>
        </form>
      </Card>

      {mutation.isPending && <LoadingState message="Running backtest..." />}

      {mutation.isError && (
        <Card className="mb-6 border-red-200 bg-red-50 text-red-700 text-sm">
          Error: {(mutation.error as Error).message}
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <BacktestSummary data={result} />
          {priceQuery.isLoading && (
            <LoadingState message="Loading price history for chart…" />
          )}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Prices, dips, and rolling high
            </h2>
            <PriceChart events={result.dip_events} fullPrices={fullPrices} />
          </Card>
          {token && newsQuery.data && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
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
            <Card className="border-dashed border-gray-200 bg-slate-50 text-sm text-gray-600">
              Sign in to see news headlines for this symbol on this page.
            </Card>
          )}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Dip Events
            </h2>
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
