import { Injectable, Logger } from "@nestjs/common";
import type { CompanyScores } from "@stockiq/shared-types";
import { computeAllScores } from "@stockiq/scoring-engine";
import { UNIVERSE } from "@stockiq/universe";
import { CacheService } from "../common/cache/cache.service";
import { MarketDataService } from "../market-data/market-data.service";
import { NewsService } from "../news/news.service";

const SCORE_TTL_SECONDS = 6 * 60 * 60; // 6h
const UNIVERSE_SNAPSHOT_TTL_SECONDS = 6 * 60 * 60; // 6h

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly marketData: MarketDataService,
    private readonly news: NewsService,
    private readonly cache: CacheService,
  ) {}

  async getScores(ticker: string): Promise<CompanyScores> {
    return this.cache.wrap(`scores:${ticker}`, SCORE_TTL_SECONDS, async () => {
      const [fundamentals, newsSignal] = await Promise.all([this.marketData.getFundamentals(ticker), this.news.getSignal(ticker)]);
      return computeAllScores({ ticker, asOf: new Date().toISOString(), fundamentals, news: newsSignal });
    });
  }

  /**
   * Scores for the entire investable universe, used by the scanner and the
   * Home screen leaderboard. Cached for hours since walking all ~135
   * tickers against a rate-limited free API is expensive; on a cold cache
   * with live Finnhub data this can take a couple of minutes the first time.
   */
  async getUniverseSnapshot(): Promise<CompanyScores[]> {
    return this.cache.wrap("scores:universe", UNIVERSE_SNAPSHOT_TTL_SECONDS, async () => {
      const results: CompanyScores[] = [];
      for (const company of UNIVERSE) {
        try {
          results.push(await this.getScores(company.ticker));
        } catch (err) {
          this.logger.warn(`No se pudo puntuar ${company.ticker}: ${(err as Error).message}`);
        }
        if (!this.marketData.isMock) {
          await sleep(250);
        }
      }
      return results;
    });
  }
}
