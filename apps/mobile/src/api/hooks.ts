import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { useAuthStore } from "@/auth/store";
import type {
  AiReport,
  AuthResponse,
  CompanyListResponse,
  CompanyProfileResponse,
  HomeResponse,
  NewsResponse,
  ScannerFilter,
  ScannerResponse,
} from "./types";

export function useHome() {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => apiFetch<HomeResponse>("/home"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanies(params: { sector?: string; search?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.sector) qs.set("sector", params.sector);
  if (params.search) qs.set("search", params.search);
  return useQuery({
    queryKey: ["companies", params],
    queryFn: () => apiFetch<CompanyListResponse>(`/companies?${qs.toString()}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanyProfile(ticker: string) {
  return useQuery({
    queryKey: ["company", ticker],
    queryFn: () => apiFetch<CompanyProfileResponse>(`/companies/${ticker}`),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAiReport(ticker: string) {
  return useQuery({
    queryKey: ["ai-report", ticker],
    queryFn: () => apiFetch<AiReport>(`/companies/${ticker}/ai-report`),
    enabled: !!ticker,
    retry: false,
    staleTime: 12 * 60 * 60 * 1000,
  });
}

export function useGenerateAiReport(ticker: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<AiReport>(`/companies/${ticker}/ai-report`, { method: "POST" }),
    onSuccess: (report) => {
      queryClient.setQueryData(["ai-report", ticker], report);
    },
  });
}

export function useNews(ticker?: string) {
  const qs = ticker ? `?ticker=${ticker}` : "";
  return useQuery({
    queryKey: ["news", ticker ?? "market"],
    queryFn: () => apiFetch<NewsResponse>(`/news${qs}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useScanner(filter: ScannerFilter, enabled: boolean) {
  return useQuery({
    queryKey: ["scanner", filter],
    queryFn: () =>
      apiFetch<ScannerResponse>("/scanner", {
        method: "POST",
        body: JSON.stringify(filter),
      }),
    enabled,
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (dto: { email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: (data) => setSession(data.accessToken, data.user),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (dto: { email: string; password: string; name?: string }) =>
      apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: (data) => setSession(data.accessToken, data.user),
  });
}
