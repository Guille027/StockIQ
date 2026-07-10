export interface ScannerFilter {
  peMax?: number;
  roeMin?: number;
  roicMin?: number;
  revenueGrowthMin?: number;
  epsGrowthMin?: number;
  operatingMarginMin?: number;
  marketCapMin?: number;
  sectors?: string[];
  upcomingEarningsWithinDays?: number;
  insiderBuyingOnly?: boolean;
  positiveNewsOnly?: boolean;
  minGlobalScore?: number;
}

export interface ScannerResultRow {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  marketCap: number;
  peRatio?: number;
  roe?: number;
  revenueGrowthYoY?: number;
  globalScore: number;
  matchedFilters: string[];
}
