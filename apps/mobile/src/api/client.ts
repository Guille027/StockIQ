import Constants from "expo-constants";
import { useAuthStore } from "@/auth/store";

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
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}
