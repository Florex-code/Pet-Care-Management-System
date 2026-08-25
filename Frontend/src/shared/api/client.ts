const API_BASE_URL = "/api/backend";
export const AUTH_TOKEN_KEY = "pawcare-auth-token-v1";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let token = typeof window === "undefined" ? null : localStorage.getItem(AUTH_TOKEN_KEY);
  if (token && tokenExpired(token)) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("pawcare-session-v2");
    token = null;
    if (!path.startsWith("/v1/auth/") && typeof window !== "undefined") {
      window.location.assign("/login?expired=1");
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; detail?: string } | null;
    if (response.status === 401 && typeof window !== "undefined" && !path.startsWith("/v1/auth/")) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem("pawcare-session-v2");
      window.location.assign("/login?expired=1");
    }
    throw new ApiError(body?.message || body?.detail || `API request failed with status ${response.status}`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function tokenExpired(token: string) {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encoded)) as { exp?: number };
    return !payload.exp || payload.exp * 1000 <= Date.now() + 5000;
  } catch { return true; }
}

export interface HealthResponse {
  status: "UP";
  timestamp: string;
}

export function getBackendHealth(signal?: AbortSignal) {
  return apiRequest<HealthResponse>("/v1/health", { signal, cache: "no-store" });
}
