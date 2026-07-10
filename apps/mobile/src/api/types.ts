import type {
  AiReport,
  Company,
  CompanyScores,
  CompetitorComparison,
  DailyMarketSummary,
  Fundamentals,
  IndexQuote,
  NewsItem,
  PriceBar,
  ScannerFilter,
  ScannerResultRow,
  ScoreChange,
} from "@stockiq/shared-types";

export type { ScannerFilter, ScannerResultRow, CompanyScores, Fundamentals, Company, NewsItem, AiReport, PriceBar };

export interface CompanyListRow {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  marketCap: number;
  peRatio?: number;
}

export interface CompanyListResponse {
  isMock: boolean;
  sectors: string[];
  count: number;
  companies: CompanyListRow[];
}

export interface CompanyProfileResponse {
  isMock: boolean;
  company: Company;
  fundamentals: Fundamentals;
  scores: CompanyScores;
  priceHistory: PriceBar[];
  competitors: CompetitorComparison[];
}

export interface HomeTopScore {
  ticker: string;
  name: string;
  sector: string;
  globalScore: number;
}

export interface HomeResponse {
  isMock: boolean;
  marketStatus: { isOpen: boolean; label: string };
  indices: IndexQuote[];
  topAiScores: HomeTopScore[];
  upcomingEarnings: unknown[];
  topNews: NewsItem[];
  biggestScoreChanges: ScoreChange[];
  dailySummary: DailyMarketSummary;
}

export interface ScannerResponse {
  count: number;
  results: ScannerResultRow[];
}

export interface NewsResponse {
  isMock: boolean;
  items: NewsItem[];
}
