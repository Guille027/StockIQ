// XP is earned ONLY for learning actions -- completing lessons, planning
// trades, reviewing mistakes, keeping discipline. There is deliberately no
// XpKind shaped like "profit": making money never grants experience, and
// XP_RULES below is the single source of amounts (server-enforced,
// idempotent via XpEvent.dedupeKey).

export type XpKind =
  | "lesson" // completed a lesson for the first time
  | "lesson_perfect" // 100% quiz score on first completion
  | "lesson_review" // re-completed an already-finished lesson (max 1/lesson/day)
  | "trade_plan" // filled the mandatory pre-trade plan
  | "coach_feedback" // generated coach feedback on a closed trade
  | "reflection" // wrote the post-trade journal reflection
  | "analysis" // opened/generated an in-depth AI report on a company (cap 3/day)
  | "streak"; // first XP-earning action of a consecutive day

export const XP_RULES: Record<XpKind, number> = {
  lesson: 50,
  lesson_perfect: 25,
  lesson_review: 10,
  trade_plan: 20,
  coach_feedback: 30,
  reflection: 25,
  analysis: 10,
  streak: 15,
};

/**
 * Cumulative XP needed to reach rank N+1 (index 0 = rank 1 at 0 XP).
 * "Rango", not "nivel" -- curriculum levels (Nivel 0-6) are a different axis.
 */
export const RANK_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4100, 5500] as const;

export const RANK_NAMES = [
  "Curioso",
  "Novato",
  "Aprendiz",
  "Observador",
  "Estudiante",
  "Analista Jr.",
  "Analista",
  "Estratega",
  "Gestor",
  "Mentor",
] as const;

/** Rank (1-based) for a given cumulative XP total. */
export function rankForXp(xpTotal: number): number {
  let rank = 1;
  RANK_THRESHOLDS.forEach((threshold, i) => {
    if (xpTotal >= threshold) rank = i + 1;
  });
  return rank;
}

export interface XpEventDto {
  id: string;
  kind: XpKind;
  amount: number;
  refId?: string;
  createdAt: string;
}

export interface ProfileResponse {
  xpTotal: number;
  rank: number;
  rankName: string;
  /** XP accumulated inside the current rank. */
  xpIntoRank: number;
  /** XP needed to go from current rank to the next (undefined at max rank). */
  xpForNextRank?: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  tradesPlanned: number;
  recentEvents: XpEventDto[];
}
