import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type {
  AiReport,
  CompanyListResponse,
  CompanyProfileResponse,
  HomeResponse,
  NewsResponse,
  PaperOrder,
  PortfolioStats,
  ScannerFilter,
  ScannerResponse,
} from "./types";

export function useHome() {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => apiFetch<HomeResponse>("/home"),
    staleTime: 5 * 60 * 1000,
    // Keep polling every 15s while the universe score snapshot is still
    // warming up server-side, so the "Mejor puntuación IA" list fills in on
    // its own without the user having to pull-to-refresh.
    refetchInterval: (query) => (query.state.data?.topAiScoresReady ? false : 15_000),
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

export function usePortfolios() {
  return useQuery({
    queryKey: ["portfolios"],
    queryFn: () => apiFetch<PortfolioStats[]>("/paper-trading/portfolios"),
    staleTime: 60 * 1000,
  });
}

export function usePortfolio(id: string) {
  return useQuery({
    queryKey: ["portfolio", id],
    queryFn: () => apiFetch<PortfolioStats>(`/paper-trading/portfolios/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function usePortfolioOrders(id: string) {
  return useQuery({
    queryKey: ["portfolio-orders", id],
    queryFn: () => apiFetch<PaperOrder[]>(`/paper-trading/portfolios/${id}/orders`),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; startingBalance: number }) =>
      apiFetch<PortfolioStats>("/paper-trading/portfolios", { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
  });
}

export function usePlaceOrder(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { ticker: string; side: "buy" | "sell"; quantity: number }) =>
      apiFetch<PortfolioStats>(`/paper-trading/portfolios/${portfolioId}/orders`, { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: (stats) => {
      queryClient.setQueryData(["portfolio", portfolioId], stats);
      queryClient.invalidateQueries({ queryKey: ["portfolio-orders", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });
}

export function useResetPortfolio(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<PortfolioStats>(`/paper-trading/portfolios/${portfolioId}/reset`, { method: "POST" }),
    onSuccess: (stats) => {
      queryClient.setQueryData(["portfolio", portfolioId], stats);
      queryClient.invalidateQueries({ queryKey: ["portfolio-orders", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (portfolioId: string) => apiFetch<void>(`/paper-trading/portfolios/${portfolioId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
  });
}
