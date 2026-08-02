import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { rankForXp, XP_RULES, type XpKind } from "@stockiq/shared-types";
import { PrismaService } from "../common/prisma/prisma.service";

export interface AwardResult {
  /** XP actually granted (0 if the dedupeKey already existed). */
  awarded: number;
  xpTotal: number;
  rank: number;
}

const PROFILE_ID = "default";

/**
 * The single choke point for granting XP. Idempotent by design: every award
 * carries a dedupeKey (unique column on XpEvent), so re-awarding the same
 * action -- re-completing a lesson, re-requesting cached coach feedback,
 * a double-tapped button -- is a silent no-op. XP is NEVER granted for
 * profit: XpKind simply has no profit-shaped member, and XP_RULES (in
 * shared-types) is the only source of amounts.
 */
@Injectable()
export class XpService {
  private readonly logger = new Logger(XpService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Grant XP for a learning action. Also maintains the daily streak: the
   * first XP-earning action of a day updates the streak counters and, on a
   * consecutive day, grants the streak bonus (itself deduped by date).
   */
  async award(kind: XpKind, refId: string | undefined, dedupeKey: string): Promise<AwardResult> {
    const amount = XP_RULES[kind];
    const granted = await this.insertEvent(kind, refId, dedupeKey, amount);

    if (!granted) {
      const profile = await this.getOrCreateProfile();
      return { awarded: 0, xpTotal: profile.xpTotal, rank: profile.rank };
    }

    // Streak bookkeeping happens on any successful award; the streak bonus is
    // itself an XpEvent deduped by local date, so it lands at most once a day.
    const today = localDate();
    const profile = await this.getOrCreateProfile();
    let streakBonus = 0;

    if (profile.lastActiveDate !== today) {
      const consecutive = profile.lastActiveDate === localDate(-1);
      const currentStreak = consecutive ? profile.currentStreak + 1 : 1;
      await this.prisma.userProfile.update({
        where: { id: PROFILE_ID },
        data: {
          lastActiveDate: today,
          currentStreak,
          longestStreak: Math.max(profile.longestStreak, currentStreak),
        },
      });
      if (kind !== "streak" && (await this.insertEvent("streak", today, `streak:${today}`, XP_RULES.streak))) {
        streakBonus = XP_RULES.streak;
      }
    }

    const updated = await this.applyXp(amount + streakBonus);
    return { awarded: amount + streakBonus, xpTotal: updated.xpTotal, rank: updated.rank };
  }

  async getOrCreateProfile() {
    return this.prisma.userProfile.upsert({
      where: { id: PROFILE_ID },
      create: { id: PROFILE_ID },
      update: {},
    });
  }

  /** True if the event was inserted, false if the dedupeKey already existed. */
  private async insertEvent(kind: XpKind, refId: string | undefined, dedupeKey: string, amount: number): Promise<boolean> {
    try {
      await this.prisma.xpEvent.create({ data: { kind, refId, dedupeKey, amount } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return false; // already awarded -- silent no-op
      }
      throw err;
    }
  }

  private async applyXp(amount: number) {
    const profile = await this.prisma.userProfile.update({
      where: { id: PROFILE_ID },
      data: { xpTotal: { increment: amount } },
    });
    const rank = rankForXp(profile.xpTotal);
    if (rank !== profile.rank) {
      return this.prisma.userProfile.update({ where: { id: PROFILE_ID }, data: { rank } });
    }
    return profile;
  }
}

/** Local server date as "YYYY-MM-DD", offset by N days (single-user app, server-local time is the truth). */
function localDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
