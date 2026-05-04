/**
 * Orval fetch mutator: returns `{ data, status, headers }` for generated clients.
 */
export const dipwiseFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const base =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    "VITE_API_BASE_URL" in import.meta.env &&
    (import.meta.env.VITE_API_BASE_URL as string)
      ? (import.meta.env.VITE_API_BASE_URL as string)
      : "";

  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("dipwise_token")
      : null;

  const headers = new Headers(options?.headers);
  const isForm = options?.body instanceof URLSearchParams;
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${url}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: unknown;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  } else {
    data = undefined;
  }

  return {
    data,
    status: res.status,
    headers: res.headers,
  } as T;
};
