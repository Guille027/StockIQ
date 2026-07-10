export interface PriceBar {
  t: string; // ISO date/time
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type PriceRange = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX";

export interface IndexQuote {
  symbol: string;
  name: string;
  value: number;
  changePct: number;
}

export interface EarningsHistoryPoint {
  fiscalPeriod: string; // e.g. "Q2 2026"
  reportDate: string;
  epsActual?: number;
  epsEstimate?: number;
  revenueActual?: number;
  revenueEstimate?: number;
  surprisePct?: number;
}
