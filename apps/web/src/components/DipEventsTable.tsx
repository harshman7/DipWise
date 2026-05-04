import type { DipEvent } from "@/types/analysis";

interface DipEventsTableProps {
  events: DipEvent[];
  holdingPeriods: number[];
}

export default function DipEventsTable({
  events,
  holdingPeriods,
}: DipEventsTableProps) {
  if (events.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600">
              Date
            </th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">
              Price
            </th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">
              Rolling High
            </th>
            <th className="px-4 py-2 text-right font-medium text-gray-600">
              Drawdown
            </th>
            {holdingPeriods.map((hp) => (
              <th
                key={hp}
                className="px-4 py-2 text-right font-medium text-gray-600"
              >
                {hp}d Return
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((e) => (
            <tr key={e.date} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-gray-700">{e.date}</td>
              <td className="px-4 py-2 text-right">${e.price.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">
                ${e.rolling_high.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-right text-red-600">
                -{e.drawdown_pct.toFixed(1)}%
              </td>
              {holdingPeriods.map((hp) => {
                const ret = e.returns[`${hp}d`];
                return (
                  <td
                    key={hp}
                    className={`px-4 py-2 text-right ${ret >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {ret !== undefined ? `${ret.toFixed(1)}%` : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
