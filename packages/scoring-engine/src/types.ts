import type { Fundamentals } from "@stockiq/shared-types";

/** Aggregated recent-news signal, typically produced by the news module.
 * All fields optional so the engine degrades gracefully without live news. */
export interface NewsSignalInput {
  /** -1 (very negative) .. 1 (very positive) */
  avgSentiment: number;
  importantPositiveCount: number;
  importantNegativeCount: number;
  totalRelevant: number;
}

export interface ScoringInput {
  ticker: string;
  asOf: string;
  fundamentals: Fundamentals;
  news?: NewsSignalInput;
}
