import {
  analyzeDipsAnalysisDipsPost,
  type DipAnalysisRequest,
  type DipAnalysisResponse,
} from "@dipwise/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function detailMsg(data: unknown): string {
  if (data && typeof data === "object" && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    return JSON.stringify(d);
  }
  return "Request failed";
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, detailMsg(body));
  }

  return res.json() as Promise<T>;
}

export function getHealth() {
  return request<{ status: string; service: string }>("/health");
}

export async function postAnalysisDips(
  body: DipAnalysisRequest,
): Promise<DipAnalysisResponse> {
  const res = await analyzeDipsAnalysisDipsPost(body);
  if (res.status !== 200) {
    throw new ApiError(res.status, detailMsg(res.data));
  }
  return res.data;
}

export function exportDipsCsv(body: DipAnalysisRequest): string {
  return `${API_BASE}/reports/dips/csv`;
}
