import { Injectable } from "@nestjs/common";
import { MarketDataService } from "../market-data/market-data.service";
import { NewsService } from "../news/news.service";
import { AiService } from "../ai/ai.service";

/**
 * Market overview for the "Explorar" tab. Deliberately does NOT rank or
 * highlight "best" companies -- StockIQ is an education platform and never
 * points at what to buy. The old top-10 AI scores list was removed for
 * exactly that reason.
 */
@Injectable()
export class HomeService {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly news: NewsService,
    private readonly ai: AiService,
  ) {}

  async getHome() {
    const [indices, topNews, dailySummary] = await Promise.all([
      this.marketData.getIndices(),
      this.news.getMarketNews(8),
      this.ai.getDailySummary(),
    ]);

    return {
      isMock: this.marketData.isMock,
      marketStatus: this.getMarketStatus(),
      indices,
      topNews,
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
