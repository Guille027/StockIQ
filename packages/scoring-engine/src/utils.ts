import type { ScoreFactor } from "@stockiq/shared-types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Maps a raw metric onto a 0-100 scale by linear interpolation between a
 * "worst" and "best" reference point. If `higherIsBetter` is false, the
 * mapping is inverted. Always clamped to [0, 100] so a single extreme value
 * cannot dominate the score.
 */
export function linearScore(
  value: number,
  worst: number,
  best: number,
): number {
  if (worst === best) return 50;
  const t = (value - worst) / (best - worst);
  return clamp(t * 100, 0, 100);
}

export function average(values: number[]): number {
  if (values.length === 0) return 50;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function weightedAverage(pairs: Array<[number, number]>): number {
  const totalWeight = pairs.reduce((acc, [, w]) => acc + w, 0);
  if (totalWeight === 0) return 50;
  const sum = pairs.reduce((acc, [v, w]) => acc + v * w, 0);
  return sum / totalWeight;
}

export function factor(
  label: string,
  rawValue: number | string,
  scoreContribution: number,
  benchmark: string,
  explanation: string,
): ScoreFactor {
  return {
    label,
    value: rawValue,
    contribution: Math.round(scoreContribution),
    benchmark,
    explanation,
  };
}

export function fmtPct(v: number | undefined): string {
  return v === undefined ? "n/d" : `${(v * 100).toFixed(1)}%`;
}

export function fmtRatio(v: number | undefined): string {
  return v === undefined ? "n/d" : v.toFixed(2);
}
