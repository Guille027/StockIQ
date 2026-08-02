// Curriculum content model. Lesson content itself lives in
// @stockiq/curriculum (static, Spanish, versioned in the repo) and is served
// by the API only -- the mobile app always fetches it over HTTP so quiz
// answer keys never ship inside the app bundle.

/**
 * A hand-authored candle for teaching charts -- no real timestamp, just an
 * optional label ("Día 1"). Distinct from PriceBar on purpose: examples are
 * fictional and simplified.
 */
export interface OhlcPoint {
  label?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Stats a `liveStat` block can display, resolved server-side from cached market data. */
export type LiveStatKind = "price" | "marketCap" | "per" | "eps" | "dividendYield" | "beta";

export type LessonBlock =
  /** Short explanation card. `body` is light markdown (bold, lists) -- max ~2 short paragraphs. */
  | { type: "concept"; title: string; body: string; emoji?: string }
  /**
   * Hand-authored example chart rendered client-side with react-native-svg.
   * Either a handful of annotated candles or a simple line series.
   */
  | { type: "chartExample"; caption: string; annotations?: string[]; candles?: OhlcPoint[]; line?: number[] }
  /**
   * A real, current market stat woven into the lesson (e.g. Apple's actual
   * P/E in the P/E lesson). `value` is filled by the API at serve time from
   * cached fundamentals; when unavailable it stays undefined and the client
   * renders the static caption alone -- a lesson never fails because a data
   * provider is down.
   */
  | { type: "liveStat"; ticker: string; stat: LiveStatKind; caption: string; value?: string }
  /** Single-choice quiz. `explanation` always teaches, right or wrong. */
  | { type: "quiz"; question: string; options: string[]; correctIndex: number; explanation: string }
  | { type: "trueFalse"; statement: string; answer: boolean; explanation: string };
// Reserved for phase 2: { type: "spotPattern"; ... }

export interface LessonSummary {
  id: string; // e.g. "n0-l1"
  levelId: string; // e.g. "nivel-0"
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface Lesson extends LessonSummary {
  blocks: LessonBlock[];
}

export interface Level {
  id: string; // e.g. "nivel-0"
  order: number;
  title: string;
  description: string;
  icon: string; // emoji
  lessons: LessonSummary[];
}

// ---------------------------------------------------------------------------
// API contracts
// ---------------------------------------------------------------------------

export type LessonStatus = "locked" | "available" | "completed";

export interface RoadmapLesson extends LessonSummary {
  status: LessonStatus;
  bestScorePct?: number;
}

export interface RoadmapLevel extends Omit<Level, "lessons"> {
  status: LessonStatus;
  lessons: RoadmapLesson[];
}

export interface RoadmapResponse {
  levels: RoadmapLevel[];
  /** Total lessons completed, for quick display without fetching the profile. */
  lessonsCompleted: number;
}

/** Answers keyed by block index within the lesson (quiz -> option index, trueFalse -> boolean). */
export type LessonAnswers = Record<number, number | boolean>;

export interface CompleteLessonRequest {
  answers: LessonAnswers;
}

export interface CompleteLessonResponse {
  scorePct: number;
  /** Block indexes the user answered correctly. */
  correct: number[];
  xpAwarded: number;
}
