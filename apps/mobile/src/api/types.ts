import type {
  AiReport,
  Company,
  CompanyScores,
  CompetitorComparison,
  DailyMarketSummary,
  Fundamentals,
  IndexQuote,
  NewsItem,
  PaperOrder,
  PortfolioStats,
  PriceBar,
  ScannerFilter,
  ScannerResultRow,
} from "@stockiq/shared-types";

export type { ScannerFilter, ScannerResultRow, CompanyScores, Fundamentals, Company, NewsItem, AiReport, PriceBar, PortfolioStats, PaperOrder };

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

/**
 * Market overview for the Explorar tab. No "best companies" ranking on
 * purpose: StockIQ teaches analysis, it never points at what to buy.
 */
export interface HomeResponse {
  isMock: boolean;
  marketStatus: { isOpen: boolean; label: string };
  indices: IndexQuote[];
  topNews: NewsItem[];
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

export interface TickerSearchResult {
  ticker: string;
  name: string;
  sector: string;
}

export interface TickerSearchResponse {
  results: TickerSearchResult[];
}
