import { Injectable, Logger } from "@nestjs/common";
import type { IndexQuote } from "@stockiq/shared-types";

const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

interface TrackedIndex {
  symbol: string;
  name: string;
  yahooSymbol: string;
}

const TRACKED_INDICES: TrackedIndex[] = [
  { symbol: "SPX", name: "S&P 500", yahooSymbol: "^GSPC" },
  { symbol: "NDX", name: "Nasdaq 100", yahooSymbol: "^NDX" },
  { symbol: "DJI", name: "Dow Jones", yahooSymbol: "^DJI" },
  { symbol: "SX5E", name: "Euro Stoxx 50", yahooSymbol: "^STOXX50E" },
];

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number; chartPreviousClose?: number };
    }>;
  };
}

/**
 * Major index quotes via Yahoo Finance's unofficial chart endpoint -- no
 * API key, no signup, no cost. Neither Finnhub's nor Twelve Data's free
 * tiers reliably expose index quotes, and this endpoint (the same one
 * behind the widely-used `yfinance` library) does. It's unofficial and
 * undocumented though, so it could change or get blocked without notice;
 * if a symbol fails, MarketDataService falls back to the mock index values
 * for that call rather than breaking the Home screen.
 */
@Injectable()
export class YahooIndicesProvider {
  private readonly logger = new Logger(YahooIndicesProvider.name);

  async getIndices(): Promise<IndexQuote[]> {
    const results = await Promise.all(TRACKED_INDICES.map((index) => this.fetchOne(index)));
    return results.filter((r): r is IndexQuote => r !== null);
  }

  private async fetchOne(index: TrackedIndex): Promise<IndexQuote | null> {
    try {
      const res = await fetch(`${CHART_URL}/${encodeURIComponent(index.yahooSymbol)}?interval=1d&range=5d`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) throw new Error(`Yahoo Finance respondió ${res.status}`);

      const data = (await res.json()) as YahooChartResponse;
      const meta = data.chart?.result?.[0]?.meta;
      if (!meta?.regularMarketPrice) throw new Error("Sin precio disponible");

      const changePct = meta.chartPreviousClose ? (meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose : 0;
      return { symbol: index.symbol, name: index.name, value: meta.regularMarketPrice, changePct };
    } catch (err) {
      this.logger.warn(`No se pudo obtener ${index.name} de Yahoo Finance: ${(err as Error).message}`);
      return null;
    }
  }
}
