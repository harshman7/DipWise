import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { postAnalysisDips } from "@/lib/api";
import type { DipAnalysisRequest, DipAnalysisResponse } from "@/types/analysis";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/LoadingState";
import BacktestSummary from "@/components/BacktestSummary";
import DipEventsTable from "@/components/DipEventsTable";
import PriceChart from "@/components/PriceChart";

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
  const [result, setResult] = useState<DipAnalysisResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const mutation = useMutation({
    mutationFn: (req: DipAnalysisRequest) => postAnalysisDips(req),
    onSuccess: setResult,
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
          <Input
            label="Symbol"
            placeholder="VOO"
            {...register("symbol")}
            error={errors.symbol?.message}
          />
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
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Dip Prices vs Rolling High
            </h2>
            <PriceChart events={result.dip_events} />
          </Card>
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Dip Events
            </h2>
            <DipEventsTable
              events={result.dip_events}
              holdingPeriods={
                DEFAULT_VALUES.holding_period_days
                  .split(",")
                  .map((s) => parseInt(s.trim(), 10))
              }
            />
          </Card>
        </div>
      )}
    </div>
  );
}
