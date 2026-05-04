import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPortfolioTransactionRoutePortfoliosPortfolioIdTransactionsPost,
  createPortfolioRoutePortfoliosPost,
  getPortfolioRoutePortfoliosPortfolioIdGet,
  listPortfoliosRoutePortfoliosGet,
  listPortfolioTransactionsRoutePortfoliosPortfolioIdTransactionsGet,
  PortfolioTransactionCreateTxType,
  type PortfolioCreate,
  type PortfolioTransactionCreate,
} from "@dipwise/shared";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

export default function Portfolio() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [txSymbol, setTxSymbol] = useState("");
  const [txType, setTxType] = useState<PortfolioTransactionCreate["tx_type"]>(
    PortfolioTransactionCreateTxType.buy,
  );
  const [txShares, setTxShares] = useState("");
  const [txPrice, setTxPrice] = useState("");
  const [txExecutedAt, setTxExecutedAt] = useState("");

  const { data: listRes, isLoading: listLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const r = await listPortfoliosRoutePortfoliosGet();
      if (r.status !== 200) throw new Error("Failed to load portfolios");
      return r.data;
    },
  });

  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ["portfolio", selectedId],
    enabled: selectedId != null,
    queryFn: async () => {
      const r = await getPortfolioRoutePortfoliosPortfolioIdGet(selectedId!);
      if (r.status !== 200) throw new Error("Failed to load portfolio");
      return r.data;
    },
  });

  const { data: txRes, isLoading: txLoading } = useQuery({
    queryKey: ["portfolio-transactions", selectedId],
    enabled: selectedId != null,
    queryFn: async () => {
      const r =
        await listPortfolioTransactionsRoutePortfoliosPortfolioIdTransactionsGet(
          selectedId!,
        );
      if (r.status !== 200) throw new Error("Failed to load transactions");
      return r.data;
    },
  });

  const createMut = useMutation({
    mutationFn: async (body: PortfolioCreate) => {
      const r = await createPortfolioRoutePortfoliosPost(body);
      if (r.status !== 201) throw new Error("Create failed");
      return r.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      setName("");
      setDescription("");
    },
  });

  const addTxMut = useMutation({
    mutationFn: async (body: PortfolioTransactionCreate) => {
      const r =
        await addPortfolioTransactionRoutePortfoliosPortfolioIdTransactionsPost(
          selectedId!,
          body,
        );
      if (r.status !== 201) throw new Error("Transaction failed");
      return r.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      void queryClient.invalidateQueries({ queryKey: ["portfolio", selectedId] });
      void queryClient.invalidateQueries({
        queryKey: ["portfolio-transactions", selectedId],
      });
      setTxSymbol("");
      setTxShares("");
      setTxPrice("");
      setTxExecutedAt("");
    },
  });

  if (listLoading) {
    return <LoadingState message="Loading portfolios..." />;
  }

  const portfolios = listRes ?? [];

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Track portfolios and open positions."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Create portfolio
          </h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate({
                name: name.trim(),
                description: description.trim() || null,
              });
            }}
          >
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" disabled={createMut.isPending} size="sm">
              {createMut.isPending ? "Saving…" : "Create"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Your portfolios
          </h2>
          {portfolios.length === 0 ? (
            <EmptyState
              title="No portfolios yet"
              description="Create a portfolio to start organizing positions."
            />
          ) : (
            <ul className="space-y-2">
              {portfolios.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      selectedId === p.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span className="font-medium text-gray-900">{p.name}</span>
                    {p.description && (
                      <span className="mt-0.5 block text-xs text-gray-500">
                        {p.description}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {selectedId != null && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Record trade
            </h2>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const shares = Number(txShares);
                const price = Number(txPrice);
                if (!txSymbol.trim() || Number.isNaN(shares) || Number.isNaN(price))
                  return;
                const body: PortfolioTransactionCreate = {
                  symbol: txSymbol.trim().toUpperCase(),
                  tx_type: txType,
                  shares,
                  price,
                };
                if (txExecutedAt.trim()) {
                  body.executed_at = new Date(txExecutedAt).toISOString();
                }
                addTxMut.mutate(body);
              }}
            >
              <Input
                label="Symbol"
                value={txSymbol}
                onChange={(e) => setTxSymbol(e.target.value)}
                placeholder="AAPL"
                required
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Side
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={txType}
                  onChange={(e) =>
                    setTxType(e.target.value as PortfolioTransactionCreate["tx_type"])
                  }
                >
                  <option value={PortfolioTransactionCreateTxType.buy}>Buy</option>
                  <option value={PortfolioTransactionCreateTxType.sell}>Sell</option>
                </select>
              </div>
              <Input
                label="Shares"
                type="number"
                min={0}
                step="any"
                value={txShares}
                onChange={(e) => setTxShares(e.target.value)}
                required
              />
              <Input
                label="Price"
                type="number"
                min={0}
                step="any"
                value={txPrice}
                onChange={(e) => setTxPrice(e.target.value)}
                required
              />
              <Input
                label="Executed at (optional)"
                type="datetime-local"
                value={txExecutedAt}
                onChange={(e) => setTxExecutedAt(e.target.value)}
              />
              <Button type="submit" disabled={addTxMut.isPending} size="sm">
                {addTxMut.isPending ? "Saving…" : "Add trade"}
              </Button>
              {addTxMut.isError && (
                <p className="text-sm text-red-600">Could not save trade.</p>
              )}
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Recent transactions
            </h2>
            {txLoading ? (
              <LoadingState message="Loading trades..." />
            ) : !txRes?.length ? (
              <p className="text-sm text-gray-500">No trades recorded yet.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b text-gray-500">
                      <th className="pb-2 pr-3">Time</th>
                      <th className="pb-2 pr-3">Symbol</th>
                      <th className="pb-2 pr-3">Side</th>
                      <th className="pb-2 pr-3">Shares</th>
                      <th className="pb-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txRes.map((t) => (
                      <tr key={t.id} className="border-b border-gray-100">
                        <td className="py-2 pr-3 whitespace-nowrap text-xs text-gray-600">
                          {new Date(t.executed_at).toLocaleString()}
                        </td>
                        <td className="py-2 pr-3 font-medium">{t.asset_symbol}</td>
                        <td className="py-2 pr-3 capitalize">{t.tx_type}</td>
                        <td className="py-2 pr-3">{t.shares}</td>
                        <td className="py-2">{t.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Positions
            </h2>
            {detailLoading ? (
              <LoadingState message="Loading positions..." />
            ) : detailRes && detailRes.positions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No open positions. Record a buy to open a position.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="pb-2 pr-4">Symbol</th>
                      <th className="pb-2 pr-4">Shares</th>
                      <th className="pb-2">Avg cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRes?.positions.map((pos) => (
                      <tr key={pos.id} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-medium">
                          {pos.asset_symbol ?? "—"}
                        </td>
                        <td className="py-2 pr-4">{pos.shares}</td>
                        <td className="py-2">{pos.avg_cost_basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
