import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { EarningsHistoryPoint, Fundamentals, IndexQuote, PriceBar, PriceRange } from "@stockiq/shared-types";
import { FinnhubThrottle } from "../../common/finnhub/finnhub-throttle.service";
import type { MarketDataProvider } from "./market-data-provider.interface";
import { MockMarketDataProvider } from "./mock-provider";

const BASE_URL = "https://finnhub.io/api/v1";

/**
 * Finnhub free-tier backed provider (https://finnhub.io, 60 req/min free).
 * Every outgoing request goes through the shared `FinnhubThrottle` queue
 * (also used by NewsService, since both share the same per-key rate limit)
 * so the whole app never exceeds the free-tier limit no matter how many
 * tickers get requested concurrently. Falls back to the mock provider
 * per-call if a Finnhub request still fails or a field isn't available on
 * the free tier, so a flaky response degrades gracefully instead of
 * breaking the screen.
 */
@Injectable()
export class FinnhubMarketDataProvider implements MarketDataProvider {
  readonly name = "finnhub";
  readonly isMock = false;
  private readonly logger = new Logger(FinnhubMarketDataProvider.name);
  private readonly apiKey: string;
  private readonly fallback = new MockMarketDataProvider();

  constructor(
    config: ConfigService,
    private readonly throttle: FinnhubThrottle,
  ) {
    this.apiKey = config.get<string>("FINNHUB_API_KEY") ?? "";
  }

  private get<T>(path: string, params: Record<string, string>): Promise<T> {
    return this.throttle.schedule(async () => {
      const qs = new URLSearchParams({ ...params, token: this.apiKey }).toString();
      const res = await fetch(`${BASE_URL}${path}?${qs}`);
      if (!res.ok) {
        throw new Error(`Finnhub ${path} respondió ${res.status}`);
      }
      return (await res.json()) as T;
    });
  }

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    try {
      const [quote, profile, metrics] = await Promise.all([
        this.get<FinnhubQuote>("/quote", { symbol: ticker }),
        this.get<FinnhubProfile>("/stock/profile2", { symbol: ticker }),
        this.get<FinnhubMetricResponse>("/stock/metric", { symbol: ticker, metric: "all" }),
      ]);
      const m = metrics.metric ?? {};

      if (!quote.c || quote.c <= 0) {
        throw new Error("Finnhub no devolvió un precio válido");
      }

      const sharesOutstanding = (profile.shareOutstanding ?? 0) * 1_000_000;
      // Finnhub's free-tier `stock/metric` endpoint only exposes per-share
      // cash, not an absolute figure -- deriving it from a real per-share
      // value times real shares outstanding is a legitimate calculation,
      // not invented data. Free cash flow and total debt have no reliable
      // absolute-figure field on the free tier, so they're left undefined
      // (shown as "n/d") rather than guessed from an unrelated metric.
      const cash = m.cashPerSharePerShareQuarterly !== undefined ? m.cashPerSharePerShareQuarterly * sharesOutstanding : undefined;

      return {
        ticker,
        asOf: new Date().toISOString().slice(0, 10),
        price: quote.c,
        marketCap: (profile.marketCapitalization ?? 0) * 1_000_000,
        sharesOutstanding,
        peRatio: m.peBasicExclExtraTTM,
        pegRatio: m.pegTTM ?? m.forwardPEG,
        priceToSales: m.psTTM,
        priceToBook: m.pbAnnual,
        evToEbitda: m.evEbitdaTTM,
        roe: pct(m.roeTTM),
        roic: pct(m.roiTTM),
        grossMargin: pct(m.grossMarginTTM),
        operatingMargin: pct(m.operatingMarginTTM),
        netMargin: pct(m.netProfitMarginTTM),
        eps: m.epsBasicExclExtraItemsTTM,
        revenueGrowthYoY: pct(m.revenueGrowthTTMYoy),
        epsGrowthYoY: pct(m.epsGrowthTTMYoy),
        revenueGrowth3yCagr: pct(m.revenueGrowth3Y),
        epsGrowth3yCagr: pct(m.epsGrowth3Y),
        freeCashFlow: undefined, // not available as an absolute figure on Finnhub's free tier
        totalDebt: undefined, // not available as an absolute figure on Finnhub's free tier
        cash,
        netDebtToEbitda: undefined, // not available on Finnhub's free tier
        currentRatio: m.currentRatioAnnual,
        dividendYield: pct(m.dividendYieldIndicatedAnnual),
        payoutRatio: pct(m.payoutRatioTTM),
        institutionalOwnershipPct: undefined, // not available on Finnhub free tier
        insiderOwnershipPct: undefined, // not available on Finnhub free tier
        insiderNetBuys3m: undefined, // not available on Finnhub free tier
        beta: m.beta,
        week52High: m["52WeekHigh"],
        week52Low: m["52WeekLow"],
        priceChange1M: pct(m.monthToDatePriceReturnDaily),
        priceChange3M: pct(m["13WeekPriceReturnDaily"]),
        priceChange6M: pct(m["26WeekPriceReturnDaily"]),
        priceChange12M: pct(m["52WeekPriceReturnDaily"]),
      };
    } catch (err) {
      this.logger.warn(`Fallback a datos mock para ${ticker}: ${(err as Error).message}`);
      return this.fallback.getFundamentals(ticker);
    }
  }

  async getPriceHistory(ticker: string, range: PriceRange): Promise<PriceBar[]> {
    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - secondsForRange(range);
      const candles = await this.get<FinnhubCandles>("/stock/candle", {
        symbol: ticker,
        resolution: resolutionForRange(range),
        from: String(from),
        to: String(to),
      });
      if (candles.s !== "ok" || !candles.t?.length) {
        throw new Error("Sin velas disponibles (posiblemente requiere plan de pago)");
      }
      return candles.t.map((t, i) => ({
        t: new Date(t * 1000).toISOString(),
        open: candles.o[i],
        high: candles.h[i],
        low: candles.l[i],
        close: candles.c[i],
        volume: candles.v[i],
      }));
    } catch (err) {
      this.logger.warn(`Fallback a histórico mock para ${ticker}: ${(err as Error).message}`);
      return this.fallback.getPriceHistory(ticker, range);
    }
  }

  async getEarningsHistory(ticker: string): Promise<EarningsHistoryPoint[]> {
    try {
      const earnings = await this.get<FinnhubEarnings[]>("/stock/earnings", { symbol: ticker });
      if (!earnings.length) throw new Error("Sin histórico de resultados disponible");
      return earnings.map((e) => ({
        fiscalPeriod: e.period,
        reportDate: e.period,
        epsActual: e.actual,
        epsEstimate: e.estimate,
        surprisePct: e.surprisePercent !== undefined ? e.surprisePercent / 100 : undefined,
      }));
    } catch (err) {
      this.logger.warn(`Fallback a resultados mock para ${ticker}: ${(err as Error).message}`);
      return this.fallback.getEarningsHistory(ticker);
    }
  }

  async getIndices(): Promise<IndexQuote[]> {
    // Finnhub's free tier does not reliably expose major index quotes.
    // MarketDataService tries YahooIndicesProvider first and only falls
    // back to this (the mock provider) if that fails too.
    return this.fallback.getIndices();
  }
}

function pct(v: number | undefined): number | undefined {
  return v === undefined ? undefined : v / 100;
}

function secondsForRange(r: PriceRange): number {
  const day = 86_400;
  switch (r) {
    case "1D": return day;
    case "5D": return 5 * day;
    case "1M": return 30 * day;
    case "6M": return 182 * day;
    case "YTD": return 200 * day;
    case "1Y": return 365 * day;
    case "5Y": return 5 * 365 * day;
    case "MAX": return 10 * 365 * day;
  }
}

function resolutionForRange(r: PriceRange): string {
  return r === "1D" ? "5" : r === "5D" ? "15" : "D";
}

interface FinnhubQuote {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
}
interface FinnhubProfile {
  marketCapitalization?: number;
  shareOutstanding?: number;
}
interface FinnhubMetricResponse {
  metric?: Record<string, number | undefined>;
}
interface FinnhubCandles {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
  s: string;
}
interface FinnhubEarnings {
  period: string;
  actual?: number;
  estimate?: number;
  surprisePercent?: number;
}
