import type { DipAnalysisRequest } from "@dipwise/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadDipsCsv(
  body: DipAnalysisRequest,
  symbol: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/dips/csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("CSV export failed");
  }
  const blob = await res.blob();
  triggerDownload(blob, `${symbol}_dips.csv`);
}

export async function downloadDipsPdf(
  body: DipAnalysisRequest,
  symbol: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/dips/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("PDF export failed");
  }
  const blob = await res.blob();
  triggerDownload(blob, `${symbol}_dips.pdf`);
}
