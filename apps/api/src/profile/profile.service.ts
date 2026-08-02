import { Injectable } from "@nestjs/common";
import { RANK_NAMES, RANK_THRESHOLDS, type ProfileResponse, type XpEventDto, type XpKind } from "@stockiq/shared-types";
import { PrismaService } from "../common/prisma/prisma.service";
import { XpService } from "./xp.service";

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async getProfile(): Promise<ProfileResponse> {
    const profile = await this.xp.getOrCreateProfile();
    const [lessonsCompleted, tradesPlanned, recentEvents] = await Promise.all([
      this.prisma.lessonProgress.count(),
      this.prisma.tradePlan.count(),
      this.prisma.xpEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    ]);

    const rankIdx = profile.rank - 1;
    const currentThreshold = RANK_THRESHOLDS[rankIdx] ?? 0;
    const nextThreshold = RANK_THRESHOLDS[rankIdx + 1];

    return {
      xpTotal: profile.xpTotal,
      rank: profile.rank,
      rankName: RANK_NAMES[rankIdx] ?? RANK_NAMES[RANK_NAMES.length - 1],
      xpIntoRank: profile.xpTotal - currentThreshold,
      xpForNextRank: nextThreshold !== undefined ? nextThreshold - currentThreshold : undefined,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lessonsCompleted,
      tradesPlanned,
      recentEvents: recentEvents.map(
        (e): XpEventDto => ({
          id: e.id,
          kind: e.kind as XpKind,
          amount: e.amount,
          refId: e.refId ?? undefined,
          createdAt: e.createdAt.toISOString(),
        }),
      ),
    };
  }
}
