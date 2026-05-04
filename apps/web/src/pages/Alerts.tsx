import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAlertRouteAlertsPost,
  listAlertsRouteAlertsGet,
  listAssetsAssetsGet,
  type AlertCreate,
} from "@dipwise/shared";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

export default function Alerts() {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState("VOO");
  const [alertType, setAlertType] = useState<
    "dip_threshold" | "price_below" | "sma_cross"
  >("dip_threshold");
  const [threshold, setThreshold] = useState("0.05");
  const [crossPeriod, setCrossPeriod] = useState("100");
  const [crossDirection, setCrossDirection] = useState<"below" | "above">("below");

  const { data: assetsRes } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const r = await listAssetsAssetsGet();
      if (r.status !== 200) throw new Error("Failed to load assets");
      return r.data;
    },
  });

  const { data: alertsRes, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const r = await listAlertsRouteAlertsGet();
      if (r.status !== 200) throw new Error("Failed to load alerts");
      return r.data;
    },
  });

  const createMut = useMutation({
    mutationFn: async (body: AlertCreate) => {
      const r = await createAlertRouteAlertsPost(body);
      if (r.status !== 201) throw new Error("Could not create alert");
      return r.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading alerts..." />;
  }

  const alerts = alertsRes ?? [];
  const assets = assetsRes ?? [];
  const symMap = new Map(assets.map((a) => [a.id, a.symbol]));

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Dip threshold, price floor, or SMA cross (daily check via scheduled worker)."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">New alert</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const sym = symbol.trim().toUpperCase();

              if (alertType === "sma_cross") {
                const period = parseInt(crossPeriod, 10);
                if (Number.isNaN(period) || period < 2) return;
                const body: AlertCreate = {
                  symbol: sym,
                  asset_id: null,
                  alert_type: "sma_cross",
                  threshold: 0,
                  message: null,
                  params_json: {
                    kind: "sma_cross",
                    period,
                    direction: crossDirection,
                  },
                };
                createMut.mutate(body);
                return;
              }

              const thr = parseFloat(threshold);
              if (Number.isNaN(thr)) return;
              const body: AlertCreate = {
                symbol: sym,
                asset_id: null,
                alert_type: alertType,
                threshold: thr,
                message: null,
              };
              createMut.mutate(body);
            }}
          >
            <Input
              label="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="VOO"
            />
            {assets.length > 0 && (
              <label className="block text-sm">
                <span className="text-gray-600">Or pick tracked asset</span>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value=""
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    const a = assets.find((x) => String(x.id) === id);
                    if (a) setSymbol(a.symbol);
                  }}
                >
                  <option value="">Select…</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.symbol} — {a.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block text-sm">
              <span className="text-gray-600">Type</span>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                value={alertType}
                onChange={(e) =>
                  setAlertType(e.target.value as typeof alertType)
                }
              >
                <option value="dip_threshold">
                  Dip threshold (drawdown vs rolling high, 0–1)
                </option>
                <option value="price_below">Price below (absolute $)</option>
                <option value="sma_cross">SMA cross (daily vs simple moving average)</option>
              </select>
            </label>
            {alertType === "sma_cross" ? (
              <>
                <Input
                  label="SMA period (days)"
                  value={crossPeriod}
                  onChange={(e) => setCrossPeriod(e.target.value)}
                />
                <label className="block text-sm">
                  <span className="text-gray-600">Direction</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={crossDirection}
                    onChange={(e) =>
                      setCrossDirection(e.target.value as "below" | "above")
                    }
                  >
                    <option value="below">Close crosses below SMA</option>
                    <option value="above">Close crosses above SMA</option>
                  </select>
                </label>
              </>
            ) : (
              <Input
                label={
                  alertType === "dip_threshold"
                    ? "Threshold (e.g. 0.05)"
                    : "Max price ($)"
                }
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            )}
            {createMut.isError && (
              <p className="text-sm text-red-600">
                {(createMut.error as Error).message}
              </p>
            )}
            <Button type="submit" disabled={createMut.isPending} size="sm">
              {createMut.isPending ? "Saving…" : "Add alert"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Active alerts</h2>
          {alerts.length === 0 ? (
            <EmptyState
              title="No alerts yet"
              description="Create an alert to monitor dips or technical levels."
            />
          ) : (
            <ul className="space-y-2 text-sm">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <span className="font-medium text-gray-900">
                    {symMap.get(a.asset_id) ?? `asset #${a.asset_id}`}
                  </span>
                  <span className="ml-2 text-gray-500">{a.alert_type}</span>
                  {a.alert_type !== "sma_cross" && (
                    <span className="ml-2 text-gray-700">@ {a.threshold}</span>
                  )}
                  {a.alert_type === "sma_cross" && a.params_json && (
                    <span className="ml-2 text-xs text-gray-600">
                      period {(a.params_json as { period?: number }).period ?? "—"} ·{" "}
                      {(a.params_json as { direction?: string }).direction ?? "—"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
