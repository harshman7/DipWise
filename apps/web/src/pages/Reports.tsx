import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DipAnalysisRequest } from "@dipwise/shared";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { downloadDipsCsv, downloadDipsPdf } from "@/lib/reportDownloads";

const schema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  dip_threshold: z.coerce.number().min(0.01).max(0.5),
  investment_amount: z.coerce.number().positive(),
  lookback_days: z.coerce.number().int().min(5).max(365),
  holding_period_days: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  symbol: "VOO",
  start_date: "2021-01-01",
  end_date: "2026-01-01",
  dip_threshold: 0.05,
  investment_amount: 200,
  lookback_days: 90,
  holding_period_days: "30,90,365,730",
};

export default function Reports() {
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const { register, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });

  const symbol = watch("symbol");

  const toRequest = (values: FormValues): DipAnalysisRequest => ({
    ...values,
    holding_period_days: values.holding_period_days
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n)),
  });

  const onCsv = handleSubmit(async (values) => {
    setErr(null);
    setBusy("csv");
    try {
      await downloadDipsCsv(toRequest(values), values.symbol);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  });

  const onPdf = handleSubmit(async (values) => {
    setErr(null);
    setBusy("pdf");
    try {
      await downloadDipsPdf(toRequest(values), values.symbol);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  });

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Export dip analysis as CSV or PDF using the same parameters as the backtester."
      />
      <Card>
        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Symbol" {...register("symbol")} />
          <Input label="Start" type="date" {...register("start_date")} />
          <Input label="End" type="date" {...register("end_date")} />
          <Input
            label="Dip threshold"
            type="number"
            step="0.01"
            {...register("dip_threshold")}
          />
          <Input
            label="Investment ($)"
            type="number"
            {...register("investment_amount")}
          />
          <Input
            label="Lookback days"
            type="number"
            {...register("lookback_days")}
          />
          <Input
            label="Holding periods"
            placeholder="30,90,365"
            {...register("holding_period_days")}
          />
        </form>
        {err && (
          <p className="mt-3 text-sm text-red-600">{err}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            size="sm"
            disabled={busy !== null}
            onClick={onCsv}
          >
            {busy === "csv" ? "…" : `Download CSV (${symbol})`}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy !== null}
            onClick={onPdf}
          >
            {busy === "pdf" ? "…" : `Download PDF (${symbol})`}
          </Button>
        </div>
      </Card>
    </div>
  );
}
