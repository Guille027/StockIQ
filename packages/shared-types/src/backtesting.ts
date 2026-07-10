import type { ScannerFilter } from "./scanner";

export interface StrategyDefinition {
  id: string;
  name: string;
  filter: ScannerFilter;
  rebalanceFrequency: "weekly" | "monthly" | "quarterly";
  startDate: string;
  endDate?: string;
}

export interface BacktestMetrics {
  cagr: number;
  totalReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  benchmarkTotalReturn: number; // S&P 500 over same period
}

export interface EquityCurvePoint {
  date: string;
  strategyValue: number;
  benchmarkValue: number;
}

export interface BacktestResult {
  strategy: StrategyDefinition;
  metrics: BacktestMetrics;
  equityCurve: EquityCurvePoint[];
  /** Warnings surfaced when a strategy looks overfit / fragile (too few trades,
   * concentrated in a handful of names, unusually narrow date range, etc.) */
  robustnessWarnings: string[];
}
