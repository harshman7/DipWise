import type { DipAnalysisRequest, DipAnalysisResponse } from "@/types/analysis";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export function getHealth() {
  return request<{ status: string; service: string }>("/health");
}

export function postAnalysisDips(body: DipAnalysisRequest) {
  return request<DipAnalysisResponse>("/analysis/dips", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function exportDipsCsv(body: DipAnalysisRequest): string {
  return `${API_BASE}/reports/dips/csv`;
}
