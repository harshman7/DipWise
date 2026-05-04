import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  routeAddItemWatchlistsWatchlistIdItemsPost,
  routeCreateWatchlistsPost,
  routeDeleteWatchlistsWatchlistIdDelete,
  routeListItemsWatchlistsWatchlistIdItemsGet,
  routeListWatchlistsGet,
  routeRemoveItemWatchlistsWatchlistIdItemsItemIdDelete,
} from "@dipwise/shared";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

export default function Watchlist() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newName, setNewName] = useState("My watchlist");
  const [symbol, setSymbol] = useState("AAPL");

  const { data: listsRes, isLoading: listsLoading } = useQuery({
    queryKey: ["watchlists"],
    queryFn: async () => {
      const r = await routeListWatchlistsGet();
      if (r.status !== 200) throw new Error("Failed to load watchlists");
      return r.data;
    },
  });

  const { data: itemsRes, isLoading: itemsLoading } = useQuery({
    queryKey: ["watchlist-items", selectedId],
    enabled: selectedId != null,
    queryFn: async () => {
      const r = await routeListItemsWatchlistsWatchlistIdItemsGet(selectedId!);
      if (r.status !== 200) throw new Error("Failed to load items");
      return r.data;
    },
  });

  const createListMut = useMutation({
    mutationFn: async () => {
      const r = await routeCreateWatchlistsPost({ name: newName.trim() });
      if (r.status !== 201) throw new Error("Could not create");
      return r.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  const addItemMut = useMutation({
    mutationFn: async () => {
      const r = await routeAddItemWatchlistsWatchlistIdItemsPost(selectedId!, {
        symbol: symbol.trim().toUpperCase(),
      });
      if (r.status !== 201) throw new Error("Could not add");
      return r.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["watchlist-items", selectedId],
      });
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  const removeItemMut = useMutation({
    mutationFn: async (itemId: number) => {
      const r = await routeRemoveItemWatchlistsWatchlistIdItemsItemIdDelete(
        selectedId!,
        itemId,
      );
      if (r.status !== 204) throw new Error("Remove failed");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["watchlist-items", selectedId],
      });
    },
  });

  const deleteListMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await routeDeleteWatchlistsWatchlistIdDelete(id);
      if (r.status !== 204) throw new Error("Delete failed");
    },
    onSuccess: (_, id) => {
      if (selectedId === id) setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: ["watchlists"] });
    },
  });

  if (listsLoading) {
    return <LoadingState message="Loading watchlists..." />;
  }

  const lists = listsRes ?? [];

  return (
    <div>
      <PageHeader
        title="Watchlist"
        description="Track symbols for ingestion and monitoring."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            New watchlist
          </h2>
          <div className="flex gap-2">
            <Input
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                type="button"
                size="sm"
                disabled={createListMut.isPending}
                onClick={() => createListMut.mutate()}
              >
                Create
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Your watchlists
          </h2>
          {lists.length === 0 ? (
            <EmptyState
              title="No watchlists"
              description="Create one, then add ticker symbols."
            />
          ) : (
            <ul className="space-y-2">
              {lists.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-2 py-1"
                >
                  <button
                    type="button"
                    className={`flex-1 rounded-md px-2 py-1 text-left text-sm ${
                      selectedId === w.id ? "bg-brand-50 font-medium" : ""
                    }`}
                    onClick={() => setSelectedId(w.id)}
                  >
                    {w.name}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteListMut.mutate(w.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {selectedId != null && (
        <Card className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Symbols</h2>
          <form
            className="mb-4 flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addItemMut.mutate();
            }}
          >
            <Input
              label="Add symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
            <Button type="submit" size="sm" disabled={addItemMut.isPending}>
              Add
            </Button>
          </form>
          {itemsLoading ? (
            <LoadingState message="Loading symbols..." />
          ) : (itemsRes ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">No symbols in this list.</p>
          ) : (
            <ul className="divide-y rounded-lg border border-gray-100">
              {(itemsRes ?? []).map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="font-medium">
                    {it.symbol}{" "}
                    <span className="font-normal text-gray-500">{it.name}</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemMut.mutate(it.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
