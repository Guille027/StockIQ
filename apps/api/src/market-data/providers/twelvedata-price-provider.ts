import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { PriceBar, PriceRange } from "@stockiq/shared-types";

const BASE_URL = "https://api.twelvedata.com/time_series";
// Free tier: 800 requests/day, 8 requests/minute. Price history is fetched
// on demand per company (and cached 1h, see MarketDataService), so this
// only needs to protect against bursts, not sustained throughput.
const MIN_CALL_INTERVAL_MS = 7600;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface TwelveDataValue {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}
interface TwelveDataResponse {
  status?: string;
  message?: string;
  values?: TwelveDataValue[];
}

/**
 * Historical daily/intraday candles via Twelve Data (https://twelvedata.com,
 * free tier: 800 req/day, no card required). Finnhub's free tier stopped
 * including the candle endpoint, so this is a separate, dedicated provider
 * used only for the price chart -- everything else still comes from
 * MarketDataProvider (Finnhub or mock). Optional: without
 * TWELVEDATA_API_KEY, MarketDataService falls back to the main provider's
 * own (mock) price history, same graceful-degradation pattern as the rest
 * of the app.
 */
@Injectable()
export class TwelveDataPriceProvider {
  private readonly logger = new Logger(TwelveDataPriceProvider.name);
  private readonly apiKey: string;
  private queue: Promise<unknown> = Promise.resolve();
  private lastCallAt = 0;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("TWELVEDATA_API_KEY") ?? "";
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async getPriceHistory(ticker: string, range: PriceRange): Promise<PriceBar[]> {
    const { interval, outputsize } = paramsForRange(range);
    const data = await this.throttledFetch(ticker, interval, outputsize);
    if (data.status === "error" || !data.values?.length) {
      throw new Error(`Twelve Data: ${data.message ?? "sin datos para " + ticker}`);
    }
    return data.values
      .map((v) => ({
        t: new Date(v.datetime).toISOString(),
        open: Number(v.open),
        high: Number(v.high),
        low: Number(v.low),
        close: Number(v.close),
        volume: Number(v.volume ?? 0),
      }))
      .reverse(); // Twelve Data returns newest-first; charts want chronological order
  }

  private throttledFetch(ticker: string, interval: string, outputsize: number): Promise<TwelveDataResponse> {
    const run = this.queue.then(async () => {
      const wait = Math.max(0, this.lastCallAt + MIN_CALL_INTERVAL_MS - Date.now());
      if (wait > 0) await sleep(wait);
      this.lastCallAt = Date.now();

      const qs = new URLSearchParams({ symbol: ticker, interval, outputsize: String(outputsize), apikey: this.apiKey });
      const res = await fetch(`${BASE_URL}?${qs}`);
      return (await res.json()) as TwelveDataResponse;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
}

function paramsForRange(r: PriceRange): { interval: string; outputsize: number } {
  switch (r) {
    case "1D": return { interval: "5min", outputsize: 80 };
    case "5D": return { interval: "30min", outputsize: 70 };
    case "1M": return { interval: "1day", outputsize: 30 };
    case "6M": return { interval: "1day", outputsize: 182 };
    case "YTD": return { interval: "1day", outputsize: 200 };
    case "1Y": return { interval: "1day", outputsize: 365 };
    case "5Y": return { interval: "1week", outputsize: 260 };
    case "MAX": return { interval: "1month", outputsize: 240 };
  }
}
