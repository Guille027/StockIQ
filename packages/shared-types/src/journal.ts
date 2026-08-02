// Trading journal: every order requires a pre-trade plan + emotional state,
// and automatically becomes a journal entry the user can enrich later with
// a post-trade reflection. The journal is the raw material the AI coach
// works from -- and the user's own record of their evolution.

/**
 * One-tap emotional state, captured at order time. "venganza" (revenge
 * trading) and "aburrimiento" (boredom) are the two states a coach most
 * needs to catch early.
 */
export const EMOTIONAL_STATES = ["calma", "fomo", "miedo", "euforia", "duda", "aburrimiento", "venganza"] as const;
export type EmotionalState = (typeof EMOTIONAL_STATES)[number];

export const EMOTION_LABELS: Record<EmotionalState, { label: string; emoji: string }> = {
  calma: { label: "Calma", emoji: "😌" },
  fomo: { label: "FOMO", emoji: "🏃" },
  miedo: { label: "Miedo", emoji: "😨" },
  euforia: { label: "Euforia", emoji: "🤩" },
  duda: { label: "Duda", emoji: "🤔" },
  aburrimiento: { label: "Aburrimiento", emoji: "🥱" },
  venganza: { label: "Revancha", emoji: "😤" },
};

/** The mandatory pre-trade questionnaire, answered before any order executes. */
export interface TradePlanInput {
  /** ¿Por qué compras/vendes? */
  reason: string;
  /** ¿Qué esperas que ocurra? */
  expectation: string;
  /** ¿Qué riesgo ves? */
  riskNoted: string;
  /** ¿Dónde sales si te equivocas? */
  exitPlan: string;
  /** Optional numeric stop price. */
  stopPrice?: number;
  /** % of the portfolio this order represents (recomputed server-side too). */
  portfolioPct: number;
}

export interface TradePlanDto extends TradePlanInput {
  id: string;
  orderId: string;
  portfolioId: string;
  ticker: string;
  side: "buy" | "sell";
  emotion: EmotionalState;
  createdAt: string;
}

/** JSON payload stored in JournalEntry.contentJson. */
export interface JournalContent {
  /** Snapshot of the plan at order time (trade entries). */
  plan?: TradePlanInput;
  emotion?: EmotionalState;
  side?: "buy" | "sell";
  quantity?: number;
  price?: number;
  /** Realized P&L % -- sells only. */
  resultPct?: number;
  /** Free-form note text (kind = "note"). */
  text?: string;
  /** Post-trade reflection, written later by the user. */
  reflection?: string;
  mistakes?: string[];
  learnings?: string[];
}

export type JournalEntryKind = "trade" | "note"; // phase 2: "mission", "scenario"

export interface JournalEntryDto {
  id: string;
  kind: JournalEntryKind;
  orderId?: string;
  portfolioId?: string;
  ticker?: string;
  content: JournalContent;
  reflectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveReflectionRequest {
  reflection: string;
  mistakes: string[];
  learnings: string[];
}

export interface CreateNoteRequest {
  text: string;
}
