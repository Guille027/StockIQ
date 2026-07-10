export type ScoreCategory =
  | "fundamental"
  | "growth"
  | "quality"
  | "momentum"
  | "value"
  | "risk"
  | "news"
  | "financialHealth"
  | "aiConfidence";

/** One factor that contributed to a score, kept fully transparent so the
 * user can see exactly why a number is what it is. */
export interface ScoreFactor {
  label: string;
  value: number | string;
  /** -100..100, how much this factor pushed the score up or down */
  contribution: number;
  benchmark?: string;
  explanation: string;
}

export interface ScoreBreakdown {
  category: ScoreCategory;
  /** 0-100 */
  value: number;
  summary: string;
  factors: ScoreFactor[];
}

export interface CompanyScores {
  ticker: string;
  asOf: string;
  /** 0-100 weighted combination of all category scores */
  globalScore: number;
  breakdowns: ScoreBreakdown[];
}

export interface ScoreChange {
  ticker: string;
  name: string;
  previousGlobalScore: number;
  currentGlobalScore: number;
  delta: number;
  reason: string;
}
