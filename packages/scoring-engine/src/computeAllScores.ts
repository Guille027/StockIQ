import type { CompanyScores } from "@stockiq/shared-types";
import type { ScoringInput } from "./types";
import { scoreValue } from "./value";
import { scoreGrowth } from "./growth";
import { scoreQuality } from "./quality";
import { scoreMomentum } from "./momentum";
import { scoreRisk } from "./risk";
import { scoreFinancialHealth } from "./financialHealth";
import { scoreNews } from "./news";
import { scoreFundamentalComposite } from "./fundamentalComposite";
import { scoreAiConfidencePlaceholder } from "./aiConfidence";
import { computeGlobalScore } from "./global";

/**
 * Computes every independent score category for a company from its
 * fundamentals (and optional news signal), plus a weighted global score.
 * Pure function: same input always produces the same output, and every
 * number comes with a transparent, human-readable breakdown of why.
 */
export function computeAllScores(input: ScoringInput): CompanyScores {
  const { fundamentals, news } = input;

  const value = scoreValue(fundamentals);
  const growth = scoreGrowth(fundamentals);
  const quality = scoreQuality(fundamentals);
  const momentum = scoreMomentum(fundamentals);
  const risk = scoreRisk(fundamentals);
  const financialHealth = scoreFinancialHealth(fundamentals);
  const newsScore = scoreNews(news);
  const fundamental = scoreFundamentalComposite(quality, growth, value, financialHealth);
  const aiConfidence = scoreAiConfidencePlaceholder(fundamentals);

  const globalScore = computeGlobalScore({
    fundamental,
    momentum,
    risk,
    news: newsScore,
    aiConfidence,
  });

  return {
    ticker: input.ticker,
    asOf: input.asOf,
    globalScore,
    breakdowns: [fundamental, growth, quality, momentum, value, risk, newsScore, financialHealth, aiConfidence],
  };
}
