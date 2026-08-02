import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CURRICULUM, getLesson, validateQuizAnswers } from "@stockiq/curriculum";
import type {
  CompleteLessonResponse,
  Lesson,
  LessonAnswers,
  LessonStatus,
  RoadmapLevel,
  RoadmapResponse,
} from "@stockiq/shared-types";
import { PrismaService } from "../common/prisma/prisma.service";
import { MarketDataService } from "../market-data/market-data.service";
import { XpService } from "../profile/xp.service";

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketData: MarketDataService,
    private readonly xp: XpService,
  ) {}

  /**
   * The full level path with per-lesson progress. Unlock rule: a level opens
   * when the previous level has all its lessons completed (levels without
   * authored lessons yet count as never-completable -> everything after them
   * stays locked, shown as "Próximamente"). Lessons inside an unlocked level
   * can be taken in any order.
   */
  async getRoadmap(): Promise<RoadmapResponse> {
    const progress = await this.prisma.lessonProgress.findMany();
    const byLessonId = new Map(progress.map((p) => [p.lessonId, p]));

    let previousLevelDone = true; // nivel-0 is always unlocked
    const levels: RoadmapLevel[] = CURRICULUM.map((level) => {
      const unlocked = previousLevelDone;
      const lessons = level.lessons.map((lesson) => {
        const record = byLessonId.get(lesson.id);
        const status: LessonStatus = !unlocked ? "locked" : record ? "completed" : "available";
        return { ...lesson, status, bestScorePct: record?.bestScorePct };
      });
      const levelDone = level.lessons.length > 0 && lessons.every((l) => l.status === "completed");
      const status: LessonStatus = !unlocked ? "locked" : levelDone ? "completed" : "available";
      previousLevelDone = levelDone;
      return { ...level, status, lessons };
    });

    return { levels, lessonsCompleted: progress.length };
  }

  /**
   * Full lesson content, with liveStat blocks enriched from cached market
   * data. A provider failure NEVER blocks a lesson: the block simply keeps
   * `value: undefined` and the client renders its static caption.
   */
  async getLessonWithLiveStats(id: string): Promise<Lesson> {
    const lesson = getLesson(id);
    if (!lesson) throw new NotFoundException(`No existe la lección "${id}".`);

    const blocks = await Promise.all(
      lesson.blocks.map(async (block) => {
        if (block.type !== "liveStat") return block;
        try {
          const value = await this.resolveLiveStat(block.ticker, block.stat);
          return { ...block, value };
        } catch (err) {
          this.logger.warn(`liveStat ${block.ticker}/${block.stat} no disponible: ${(err as Error).message}`);
          return block;
        }
      }),
    );

    return { ...lesson, blocks };
  }

  async completeLesson(id: string, answers: LessonAnswers): Promise<CompleteLessonResponse> {
    const validation = validateQuizAnswers(id, answers);
    if (!validation) throw new NotFoundException(`No existe la lección "${id}".`);
    const lesson = getLesson(id)!;

    const existing = await this.prisma.lessonProgress.findUnique({ where: { lessonId: id } });
    await this.prisma.lessonProgress.upsert({
      where: { lessonId: id },
      create: {
        lessonId: id,
        levelId: lesson.levelId,
        bestScorePct: validation.scorePct,
        lastScorePct: validation.scorePct,
        answersJson: JSON.stringify(answers),
      },
      update: {
        attempts: { increment: 1 },
        bestScorePct: Math.max(existing?.bestScorePct ?? 0, validation.scorePct),
        lastScorePct: validation.scorePct,
        answersJson: JSON.stringify(answers),
        lastCompletedAt: new Date(),
      },
    });

    let xpAwarded = 0;
    if (!existing) {
      xpAwarded += (await this.xp.award("lesson", id, `lesson:${id}`)).awarded;
      if (validation.scorePct === 100) {
        xpAwarded += (await this.xp.award("lesson_perfect", id, `lessonperfect:${id}`)).awarded;
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      xpAwarded += (await this.xp.award("lesson_review", id, `review:${id}:${today}`)).awarded;
    }

    return { scorePct: validation.scorePct, correct: validation.correct, xpAwarded };
  }

  private async resolveLiveStat(ticker: string, stat: string): Promise<string | undefined> {
    const f = await this.marketData.getFundamentals(ticker);
    switch (stat) {
      case "price":
        return `$${f.price.toFixed(2)}`;
      case "marketCap":
        return f.marketCap !== undefined ? formatMarketCap(f.marketCap) : undefined;
      case "per":
        return f.peRatio !== undefined ? f.peRatio.toFixed(1) : undefined;
      case "eps":
        return f.eps !== undefined ? `$${f.eps.toFixed(2)}` : undefined;
      case "dividendYield":
        return f.dividendYield !== undefined ? `${(f.dividendYield * 100).toFixed(2)}%` : undefined;
      case "beta":
        return f.beta !== undefined ? f.beta.toFixed(2) : undefined;
      default:
        return undefined;
    }
  }
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)} billones (trillions)`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)} mil millones`;
  return `$${(value / 1e6).toFixed(0)} millones`;
}
