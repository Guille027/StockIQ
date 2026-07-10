import { Inject, Injectable } from "@nestjs/common";
import type { EarningsHistoryPoint, Fundamentals, IndexQuote, PriceBar, PriceRange } from "@stockiq/shared-types";
import { CacheService } from "../common/cache/cache.service";
import { MARKET_DATA_PROVIDER, MarketDataProvider } from "./providers/market-data-provider.interface";

const FUNDAMENTALS_TTL_SECONDS = 6 * 60 * 60; // 6h
const PRICE_HISTORY_TTL_SECONDS = 60 * 60; // 1h
const INDICES_TTL_SECONDS = 15 * 60; // 15min

@Injectable()
export class MarketDataService {
  constructor(
    @Inject(MARKET_DATA_PROVIDER) private readonly provider: MarketDataProvider,
    private readonly cache: CacheService,
  ) {}

  get isMock(): boolean {
    return this.provider.isMock;
  }

  get providerName(): string {
    return this.provider.name;
  }

  getFundamentals(ticker: string): Promise<Fundamentals> {
    return this.cache.wrap(`fundamentals:${ticker}`, FUNDAMENTALS_TTL_SECONDS, () => this.provider.getFundamentals(ticker));
  }

  getPriceHistory(ticker: string, range: PriceRange): Promise<PriceBar[]> {
    return this.cache.wrap(`price:${ticker}:${range}`, PRICE_HISTORY_TTL_SECONDS, () => this.provider.getPriceHistory(ticker, range));
  }

  getEarningsHistory(ticker: string): Promise<EarningsHistoryPoint[]> {
    return this.cache.wrap(`earnings:${ticker}`, FUNDAMENTALS_TTL_SECONDS, () => this.provider.getEarningsHistory(ticker));
  }

  getIndices(): Promise<IndexQuote[]> {
    return this.cache.wrap("indices", INDICES_TTL_SECONDS, () => this.provider.getIndices());
  }
}
