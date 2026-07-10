import { Inject, Injectable, Logger } from "@nestjs/common";
import type { EarningsHistoryPoint, Fundamentals, IndexQuote, PriceBar, PriceRange } from "@stockiq/shared-types";
import { CacheService } from "../common/cache/cache.service";
import { MARKET_DATA_PROVIDER, MarketDataProvider } from "./providers/market-data-provider.interface";
import { TwelveDataPriceProvider } from "./providers/twelvedata-price-provider";
import { YahooIndicesProvider } from "./providers/yahoo-indices-provider";

const FUNDAMENTALS_TTL_SECONDS = 6 * 60 * 60; // 6h
const PRICE_HISTORY_TTL_SECONDS = 60 * 60; // 1h
const INDICES_TTL_SECONDS = 15 * 60; // 15min

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    @Inject(MARKET_DATA_PROVIDER) private readonly provider: MarketDataProvider,
    private readonly cache: CacheService,
    private readonly twelveData: TwelveDataPriceProvider,
    private readonly yahooIndices: YahooIndicesProvider,
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
    return this.cache.wrap(`price:${ticker}:${range}`, PRICE_HISTORY_TTL_SECONDS, async () => {
      if (this.twelveData.isConfigured) {
        try {
          return await this.twelveData.getPriceHistory(ticker, range);
        } catch (err) {
          this.logger.warn(`Fallback al proveedor principal para el histórico de ${ticker}: ${(err as Error).message}`);
        }
      }
      return this.provider.getPriceHistory(ticker, range);
    });
  }

  getEarningsHistory(ticker: string): Promise<EarningsHistoryPoint[]> {
    return this.cache.wrap(`earnings:${ticker}`, FUNDAMENTALS_TTL_SECONDS, () => this.provider.getEarningsHistory(ticker));
  }

  getIndices(): Promise<IndexQuote[]> {
    return this.cache.wrap("indices", INDICES_TTL_SECONDS, async () => {
      try {
        const indices = await this.yahooIndices.getIndices();
        if (indices.length > 0) return indices;
      } catch (err) {
        this.logger.warn(`Fallback a índices mock: ${(err as Error).message}`);
      }
      return this.provider.getIndices();
    });
  }
}
