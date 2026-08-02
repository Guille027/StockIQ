import Constants from "expo-constants";

/**
 * Resolves the StockIQ API base URL. On a physical device, "localhost"
 * points at the phone itself, not your PC -- set EXPO_PUBLIC_API_URL (or
 * app.json's expo.extra.apiBaseUrl) to your computer's LAN IP, e.g.
 * http://192.168.1.42:3000 (find it with `ipconfig` on Windows). See the
 * root README for the full walkthrough.
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  const fromConfig = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  return fromConfig ?? "http://localhost:3000";
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      // Fastify rejects a JSON content-type with an empty body, so only
      // declare it when we're actually sending one (body-less POSTs like
      // /coach/review or /reset stay header-less).
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}
