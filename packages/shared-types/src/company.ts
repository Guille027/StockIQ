/** A company in the investable universe (large-cap, liquid, equities only). */
export interface Company {
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  sector: string;
  industry: string;
  country: string;
  indices: IndexMembership[];
  logoUrl?: string;
  description?: string;
}

export type IndexMembership = "SP100" | "NASDAQ100" | "DOWJONES" | "EU_LARGE_CAP";

/** Snapshot of a company's fundamentals at a point in time. Never mixes in
 * derivative-instrument, crypto, or FX data — equities only. */
export interface Fundamentals {
  ticker: string;
  asOf: string; // ISO date

  price: number;
  marketCap: number;
  sharesOutstanding: number;

  // Valuation
  peRatio?: number;
  pegRatio?: number;
  priceToSales?: number;
  priceToBook?: number;
  evToEbitda?: number;

  // Profitability
  roe?: number;
  roic?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  eps?: number;

  // Growth (YoY unless noted)
  revenueGrowthYoY?: number;
  epsGrowthYoY?: number;
  revenueGrowth3yCagr?: number;
  epsGrowth3yCagr?: number;

  // Cash flow & balance sheet
  freeCashFlow?: number;
  totalDebt?: number;
  cash?: number;
  netDebtToEbitda?: number;
  currentRatio?: number;

  // Capital return
  dividendYield?: number;
  payoutRatio?: number;
  buybackYield?: number;

  // Ownership
  institutionalOwnershipPct?: number;
  insiderOwnershipPct?: number;
  insiderNetBuys3m?: number; // net shares bought (negative = net selling)

  // Market / momentum / risk inputs
  beta?: number;
  week52High?: number;
  week52Low?: number;
  priceChange1M?: number;
  priceChange3M?: number;
  priceChange6M?: number;
  priceChange12M?: number;
}

export interface CompetitorComparison {
  ticker: string;
  name: string;
  peRatio?: number;
  roe?: number;
  revenueGrowthYoY?: number;
  marketCap?: number;
  globalScore?: number;
}
