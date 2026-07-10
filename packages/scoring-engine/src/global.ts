import type { ScoreBreakdown } from "@stockiq/shared-types";
import { weightedAverage } from "./utils";

export const GLOBAL_SCORE_WEIGHTS = {
  fundamental: 40,
  momentum: 15,
  risk: 15,
  news: 15,
  aiConfidence: 15,
} as const;

export function computeGlobalScore(breakdowns: Record<keyof typeof GLOBAL_SCORE_WEIGHTS, ScoreBreakdown>): number {
  const pairs: Array<[number, number]> = (Object.keys(GLOBAL_SCORE_WEIGHTS) as Array<keyof typeof GLOBAL_SCORE_WEIGHTS>).map(
    (key) => [breakdowns[key].value, GLOBAL_SCORE_WEIGHTS[key]],
  );
  return Math.round(weightedAverage(pairs));
}
