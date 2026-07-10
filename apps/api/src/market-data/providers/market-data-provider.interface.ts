import type { EarningsHistoryPoint, Fundamentals, IndexQuote, PriceBar, PriceRange } from "@stockiq/shared-types";

export const MARKET_DATA_PROVIDER = Symbol("MARKET_DATA_PROVIDER");

/**
 * Every market-data backend (Finnhub, a future paid provider, the mock
 * fallback...) implements this single interface. Nothing else in the app
 * talks to a specific vendor's API shape directly, so swapping providers
 * later is a one-file change.
 */
export interface MarketDataProvider {
  readonly name: string;
  readonly isMock: boolean;
  getFundamentals(ticker: string): Promise<Fundamentals>;
  getPriceHistory(ticker: string, range: PriceRange): Promise<PriceBar[]>;
  getEarningsHistory(ticker: string): Promise<EarningsHistoryPoint[]>;
  getIndices(): Promise<IndexQuote[]>;
}
