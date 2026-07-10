import type { NewsSentiment } from "@stockiq/shared-types";

const POSITIVE_WORDS = [
  "beats", "beat estimates", "surge", "surges", "record", "upgrade", "upgraded", "growth", "strong",
  "profit", "rally", "outperform", "raises guidance", "buyback", "approval", "partnership", "expansion",
  "soars", "jumps", "tops estimates", "bullish",
];
const NEGATIVE_WORDS = [
  "miss", "misses estimates", "plunge", "plunges", "downgrade", "downgraded", "lawsuit", "recall",
  "investigation", "layoffs", "bankruptcy", "decline", "declines", "warns", "cuts guidance", "fraud",
  "fine", "delay", "weak", "sinks", "slumps", "bearish", "probe",
];
const IMPORTANCE_WORDS = [
  "earnings", "guidance", "ceo", "acquisition", "merger", "lawsuit", "recall", "bankruptcy",
  "downgrade", "upgrade", "fda", "antitrust", "layoffs", "dividend", "split", "sec ", "investigation",
];

export function analyzeSentiment(text: string): { sentiment: NewsSentiment; importance: number } {
  const lower = text.toLowerCase();
  let score = 0;
  for (const w of POSITIVE_WORDS) if (lower.includes(w)) score += 1;
  for (const w of NEGATIVE_WORDS) if (lower.includes(w)) score -= 1;

  const sentiment: NewsSentiment = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";

  let importanceMatches = 0;
  for (const w of IMPORTANCE_WORDS) if (lower.includes(w)) importanceMatches += 1;
  const importance = Math.min(100, 30 + importanceMatches * 15 + Math.abs(score) * 5);

  return { sentiment, importance };
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(normalize(a).split(" "));
  const setB = new Set(normalize(b).split(" "));
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/** Removes exact and near-duplicate headlines (Jaccard similarity >= 0.6),
 * keeping the earliest/first-seen item and recording how many were merged. */
export function dedupeByHeadline<T extends { headline: string; dedupedFromCount?: number }>(items: T[]): T[] {
  const kept: T[] = [];
  for (const item of items) {
    const match = kept.find((k) => jaccardSimilarity(k.headline, item.headline) >= 0.6);
    if (match) {
      match.dedupedFromCount = (match.dedupedFromCount ?? 1) + 1;
    } else {
      kept.push({ ...item, dedupedFromCount: 1 });
    }
  }
  return kept;
}
