import { Injectable } from "@nestjs/common";
import { getCompany } from "@stockiq/universe";
import { MarketDataService } from "../market-data/market-data.service";
import { ScoringService } from "../scoring/scoring.service";
import { NewsService } from "../news/news.service";
import { AiService } from "../ai/ai.service";

@Injectable()
export class HomeService {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly scoring: ScoringService,
    private readonly news: NewsService,
    private readonly ai: AiService,
  ) {}

  async getHome() {
    const [indices, topNews, dailySummary, scoreChanges] = await Promise.all([
      this.marketData.getIndices(),
      this.news.getMarketNews(8),
      this.ai.getDailySummary(),
      this.ai.getBiggestScoreChanges(),
    ]);

    // Never blocks: if the universe-wide scores aren't warm yet, this kicks
    // off (or joins) the background computation and returns undefined right
    // away, so Home stays responsive instead of hanging for minutes on a
    // cold cache. See ScoringService.onModuleInit for the boot-time warm-up.
    const snapshot = this.scoring.getUniverseSnapshotIfReady();
    const topAiScoresReady = snapshot !== undefined;
    const topAiScores = topAiScoresReady
      ? [...snapshot]
          .sort((a, b) => b.globalScore - a.globalScore)
          .slice(0, 10)
          .map((s) => ({
            ticker: s.ticker,
            name: getCompany(s.ticker)?.name ?? s.ticker,
            sector: getCompany(s.ticker)?.sector ?? "",
            globalScore: s.globalScore,
          }))
      : [];

    return {
      isMock: this.marketData.isMock,
      marketStatus: this.getMarketStatus(),
      indices,
      topAiScores,
      topAiScoresReady,
      // Populated once the calendar module (phase 2) is implemented.
      upcomingEarnings: [] as unknown[],
      topNews,
      biggestScoreChanges: scoreChanges,
      dailySummary,
    };
  }

  private getMarketStatus(): { isOpen: boolean; label: string } {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      weekday: "short",
    }).formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    const minutesSinceMidnight = hour * 60 + minute;
    const isWeekday = !["Sat", "Sun"].includes(weekday);
    const isOpen = isWeekday && minutesSinceMidnight >= 9 * 60 + 30 && minutesSinceMidnight < 16 * 60;

    return { isOpen, label: isOpen ? "Mercado abierto (NYSE/Nasdaq)" : "Mercado cerrado" };
  }
}
