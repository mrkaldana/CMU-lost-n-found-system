type ApiError = { message?: string };

function getDefaultApiUrl() {
  if (typeof window === "undefined") return "http://localhost:5000";
  return `${window.location.protocol}//${window.location.hostname}:5000`;
}

function resolveApiUrl() {
  const defaultUrl = getDefaultApiUrl();
  const configuredUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

  if (!configuredUrl) return defaultUrl;
  if (typeof window === "undefined") return configuredUrl.replace(/\/+$/, "");

  try {
    const parsed = new URL(configuredUrl);
    const isConfiguredLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    const isClientLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    // If frontend is opened from another device, ignore localhost API targets.
    if (isConfiguredLocalhost && !isClientLocalhost) {
      return defaultUrl;
    }

    return configuredUrl.replace(/\/+$/, "");
  } catch {
    return defaultUrl;
  }
}

const API_URL = resolveApiUrl();

export function getApiUrl() {
  return API_URL;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const res = await fetch(url, { ...options, headers });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message = (data as ApiError | null)?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

