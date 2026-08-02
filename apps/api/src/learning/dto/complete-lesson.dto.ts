import { IsObject } from "class-validator";
import type { LessonAnswers } from "@stockiq/shared-types";

export class CompleteLessonDto {
  /** Block index -> chosen option index (quiz) or boolean (trueFalse). */
  @IsObject()
  answers!: LessonAnswers;
}
