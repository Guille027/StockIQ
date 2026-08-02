import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CoachFeedbackResponse,
  CompleteLessonResponse,
  EmotionalState,
  JournalEntryDto,
  Lesson,
  LessonAnswers,
  PlaceOrderResponse,
  ProfileResponse,
  RoadmapResponse,
  SaveReflectionRequest,
  TradePlanDto,
  TradePlanInput,
} from "@stockiq/shared-types";
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
  TickerSearchResponse,
} from "./types";

export function useHome() {
  return useQuery({
    queryKey: ["home"],
    queryFn: () => apiFetch<HomeResponse>("/home"),
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Learning / profile
// ---------------------------------------------------------------------------

export function useRoadmap() {
  return useQuery({
    queryKey: ["roadmap"],
    queryFn: () => apiFetch<RoadmapResponse>("/learning/roadmap"),
    staleTime: 60 * 1000,
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => apiFetch<Lesson>(`/learning/lessons/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCompleteLesson(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: LessonAnswers) =>
      apiFetch<CompleteLessonResponse>(`/learning/lessons/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfileResponse>("/profile"),
    staleTime: 30 * 1000,
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

export function useTickerSearch(query: string) {
  return useQuery({
    queryKey: ["ticker-search", query],
    queryFn: () => apiFetch<TickerSearchResponse>(`/companies/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
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

export interface PlaceOrderInput {
  ticker: string;
  side: "buy" | "sell";
  quantity?: number;
  amount?: number;
  plan: TradePlanInput;
  emotion: EmotionalState;
}

export function usePlaceOrder(portfolioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PlaceOrderInput) =>
      apiFetch<PlaceOrderResponse>(`/paper-trading/portfolios/${portfolioId}/orders`, { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: (res) => {
      queryClient.setQueryData(["portfolio", portfolioId], res.portfolio);
      queryClient.invalidateQueries({ queryKey: ["portfolio-orders", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

export function useJournal(filter: { ticker?: string; kind?: string } = {}) {
  const qs = new URLSearchParams();
  if (filter.ticker) qs.set("ticker", filter.ticker);
  if (filter.kind) qs.set("kind", filter.kind);
  return useQuery({
    queryKey: ["journal", filter],
    queryFn: () => apiFetch<JournalEntryDto[]>(`/journal?${qs.toString()}`),
    staleTime: 30 * 1000,
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: ["journal-entry", id],
    queryFn: () => apiFetch<JournalEntryDto & { tradePlan?: TradePlanDto }>(`/journal/${id}`),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Coach
// ---------------------------------------------------------------------------

export function useCoachFeedback(orderId: string | undefined) {
  return useQuery({
    queryKey: ["coach", orderId],
    queryFn: () => apiFetch<CoachFeedbackResponse>(`/coach/trades/${orderId}`),
    enabled: !!orderId,
    retry: false, // 404 just means "not generated yet"
    staleTime: Infinity, // permanent server-side cache
  });
}

export function useRequestCoachFeedback(orderId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<CoachFeedbackResponse>(`/coach/trades/${orderId}`, { method: "POST" }),
    onSuccess: (res) => {
      queryClient.setQueryData(["coach", orderId], res);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useCoachReview() {
  return useMutation({
    mutationFn: () => apiFetch<CoachFeedbackResponse>("/coach/review", { method: "POST" }),
  });
}

export function useSaveReflection(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SaveReflectionRequest) =>
      apiFetch<JournalEntryDto & { xpAwarded: number }>(`/journal/${id}/reflection`, { method: "PATCH", body: JSON.stringify(dto) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entry", id] });
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
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
