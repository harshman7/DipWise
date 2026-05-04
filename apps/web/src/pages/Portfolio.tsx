import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPortfolioRoutePortfoliosPost,
  getPortfolioRoutePortfoliosPortfolioIdGet,
  listPortfoliosRoutePortfoliosGet,
  type PortfolioCreate,
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
        <Card className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Positions
          </h2>
          {detailLoading ? (
            <LoadingState message="Loading positions..." />
          ) : detailRes && detailRes.positions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No positions yet. (Add positions via API or future releases.)
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
      )}
    </div>
  );
}
