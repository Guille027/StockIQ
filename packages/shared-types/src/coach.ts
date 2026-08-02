// The AI coach analyzes PROCESS, never results: did the user follow their
// plan, buy on impulse, cut winners early, let losers run. It is a mentor,
// never a judge, and it never recommends buying or selling anything.

export interface CoachFeedbackDto {
  /** Did the trade respect the user's own pre-trade plan? */
  followedPlan: boolean;
  /** Short analysis of how the execution compared to the stated plan. */
  planAdherence: string;
  /** Reading of the emotional state vs. the decision taken. */
  emotionalRead: string;
  /** What the user did well (process-wise). */
  strengths: string[];
  /** What to improve next time -- concrete, kind, actionable. */
  improvements: string[];
  /** Curriculum lesson ids worth (re)visiting, e.g. ["n1-l6"]. */
  suggestedLessonIds: string[];
  /** The Socratic question the coach always ends with. */
  question: string;
  /** True when generated without an AI key (clearly labeled in the UI). */
  isMock: boolean;
}

export type CoachScope = "trade" | "period"; // phase 2: "scenario"

export interface CoachFeedbackResponse {
  scope: CoachScope;
  refId: string;
  feedback: CoachFeedbackDto;
  createdAt: string;
  xpAwarded: number;
}
