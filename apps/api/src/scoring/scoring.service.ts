import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import type { CompanyScores } from "@stockiq/shared-types";
import { computeAllScores } from "@stockiq/scoring-engine";
import { UNIVERSE } from "@stockiq/universe";
import { CacheService } from "../common/cache/cache.service";
import { MarketDataService } from "../market-data/market-data.service";
import { NewsService } from "../news/news.service";

const SCORE_TTL_SECONDS = 6 * 60 * 60; // 6h
const UNIVERSE_SNAPSHOT_TTL_SECONDS = 6 * 60 * 60; // 6h
const UNIVERSE_SNAPSHOT_KEY = "scores:universe";

@Injectable()
export class ScoringService implements OnModuleInit {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly marketData: MarketDataService,
    private readonly news: NewsService,
    private readonly cache: CacheService,
  ) {}

  /** Start warming the universe snapshot the moment the server boots, so
   * it's often already ready (or at least well underway) by the time
   * someone opens the app, instead of only starting on the first request. */
  onModuleInit() {
    this.cache.getOrTrigger(UNIVERSE_SNAPSHOT_KEY, UNIVERSE_SNAPSHOT_TTL_SECONDS, () => this.computeUniverseSnapshot());
  }

  async getScores(ticker: string): Promise<CompanyScores> {
    return this.cache.wrap(`scores:${ticker}`, SCORE_TTL_SECONDS, async () => {
      const [fundamentals, newsSignal] = await Promise.all([this.marketData.getFundamentals(ticker), this.news.getSignal(ticker)]);
      return computeAllScores({ ticker, asOf: new Date().toISOString(), fundamentals, news: newsSignal });
    });
  }

  /**
   * Scores for the entire investable universe, used by the scanner. Cached
   * for hours since walking all ~145 tickers against a rate-limited free
   * API is expensive: each ticker needs 3 Finnhub calls for fundamentals +
   * 1 for news, all serialized through `FinnhubThrottle` at ~1 req/sec --
   * on a cold cache with a live Finnhub key this can take several minutes
   * the first time. Individual company lookups (`getScores`) stay fast
   * (~4s) since they only need one ticker. Blocks until the snapshot is
   * ready -- fine for the scanner (an explicit user action that already
   * expects to wait for a real answer); Home uses
   * `getUniverseSnapshotIfReady` instead so it never blocks.
   */
  async getUniverseSnapshot(): Promise<CompanyScores[]> {
    return this.cache.wrap(UNIVERSE_SNAPSHOT_KEY, UNIVERSE_SNAPSHOT_TTL_SECONDS, () => this.computeUniverseSnapshot());
  }

  /**
   * Same data as `getUniverseSnapshot`, but never blocks: returns the
   * cached snapshot if one is ready, otherwise kicks off (or joins) the
   * background computation and returns `undefined` immediately so the
   * caller can respond right away instead of leaving the screen hanging
   * for minutes on a cold cache.
   */
  getUniverseSnapshotIfReady(): CompanyScores[] | undefined {
    return this.cache.getOrTrigger(UNIVERSE_SNAPSHOT_KEY, UNIVERSE_SNAPSHOT_TTL_SECONDS, () => this.computeUniverseSnapshot());
  }

  private async computeUniverseSnapshot(): Promise<CompanyScores[]> {
    const results: CompanyScores[] = [];
    for (const company of UNIVERSE) {
      try {
        results.push(await this.getScores(company.ticker));
      } catch (err) {
        this.logger.warn(`No se pudo puntuar ${company.ticker}: ${(err as Error).message}`);
      }
    }
    return results;
  }
}
