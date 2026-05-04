import {
  analyzeDipsAnalysisDipsPost,
  loginAuthLoginPost,
  registerAuthRegisterPost,
  type DipAnalysisRequest,
  type DipAnalysisResponse,
  type LoginRequest,
  type RegisterRequest,
} from "@dipwise/shared";
import { getStoredToken } from "@/context/AuthContext";

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
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    localStorage.removeItem("dipwise_token");
    if (!path.startsWith("/auth/")) {
      window.location.assign("/login");
    }
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, detailMsg(body));
  }

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

export async function loginRequest(body: LoginRequest) {
  const res = await loginAuthLoginPost(body);
  if (res.status !== 200) {
    throw new ApiError(res.status, detailMsg(res.data));
  }
  return res.data;
}

export async function registerRequest(body: RegisterRequest) {
  const res = await registerAuthRegisterPost(body);
  if (res.status !== 201) {
    throw new ApiError(res.status, detailMsg(res.data));
  }
  return res.data;
}
