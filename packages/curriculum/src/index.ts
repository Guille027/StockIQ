// StockIQ curriculum: static, curated, Spanish lesson content, versioned in
// the repo. Imported by the API ONLY -- quiz answer keys must never ship in
// the mobile bundle; the app always receives lessons over HTTP (and the
// /complete endpoint validates answers server-side).

import type { LessonAnswers, Lesson, LessonSummary, Level } from "@stockiq/shared-types";
import { meta as nivel0Meta, lessons as nivel0Lessons } from "./levels/nivel-0/meta";
import { meta as nivel1Meta, lessons as nivel1Lessons } from "./levels/nivel-1/meta";
import { lockedLevelMetas } from "./levels/locked-levels";

function toSummary(lesson: Lesson): LessonSummary {
  const { blocks: _blocks, ...summary } = lesson;
  return summary;
}

const LEVEL_LESSONS: ReadonlyMap<string, Lesson[]> = new Map([
  [nivel0Meta.id, nivel0Lessons],
  [nivel1Meta.id, nivel1Lessons],
]);

/** Every level in order, with lesson summaries (no blocks, no answer keys). */
export const CURRICULUM: Level[] = [
  { ...nivel0Meta, lessons: nivel0Lessons.map(toSummary) },
  { ...nivel1Meta, lessons: nivel1Lessons.map(toSummary) },
  ...lockedLevelMetas.map((meta) => ({ ...meta, lessons: (LEVEL_LESSONS.get(meta.id) ?? []).map(toSummary) })),
].sort((a, b) => a.order - b.order);

const LESSONS_BY_ID: ReadonlyMap<string, Lesson> = new Map(
  [...LEVEL_LESSONS.values()].flat().map((lesson) => [lesson.id, lesson]),
);

export function getLesson(id: string): Lesson | undefined {
  return LESSONS_BY_ID.get(id);
}

export interface QuizValidation {
  scorePct: number;
  /** Block indexes answered correctly. */
  correct: number[];
  /** Total number of gradable (quiz/trueFalse) blocks in the lesson. */
  totalQuestions: number;
}

/**
 * Grade a lesson submission server-side. Non-quiz blocks are ignored; a
 * missing answer counts as wrong. A lesson with no gradable blocks scores 100
 * (it's pure reading).
 */
export function validateQuizAnswers(lessonId: string, answers: LessonAnswers): QuizValidation | undefined {
  const lesson = LESSONS_BY_ID.get(lessonId);
  if (!lesson) return undefined;

  const correct: number[] = [];
  let totalQuestions = 0;

  lesson.blocks.forEach((block, index) => {
    if (block.type === "quiz") {
      totalQuestions++;
      if (answers[index] === block.correctIndex) correct.push(index);
    } else if (block.type === "trueFalse") {
      totalQuestions++;
      if (answers[index] === block.answer) correct.push(index);
    }
  });

  const scorePct = totalQuestions === 0 ? 100 : Math.round((correct.length / totalQuestions) * 100);
  return { scorePct, correct, totalQuestions };
}
