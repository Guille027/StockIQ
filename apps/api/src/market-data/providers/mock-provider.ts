import { Injectable } from "@nestjs/common";
import type { EarningsHistoryPoint, Fundamentals, IndexQuote, PriceBar, PriceRange } from "@stockiq/shared-types";
import { getCompany } from "@stockiq/universe";
import type { MarketDataProvider } from "./market-data-provider.interface";

/** Seeded PRNG so the same ticker always yields the same "random" mock
 * numbers across requests/restarts -- makes the demo data feel stable
 * instead of jittering on every call. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromTicker(ticker: string): number {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = (hash * 31 + ticker.charCodeAt(i)) | 0;
  }
  return hash;
}

function range(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

/**
 * Generates plausible, internally-consistent large-cap fundamentals without
 * any external API. Clearly labeled `isMock: true` everywhere it's surfaced
 * to the user -- this is dev/demo data, never presented as real.
 */
@Injectable()
export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = "mock";
  readonly isMock = true;

  async getFundamentals(ticker: string): Promise<Fundamentals> {
    const rand = mulberry32(seedFromTicker(ticker));
    const company = getCompany(ticker);
    const price = range(rand, 20, 650);
    const marketCap = price * range(rand, 300_000_000, 9_000_000_000);

    return {
      ticker,
      asOf: new Date().toISOString().slice(0, 10),
      price: round2(price),
      marketCap: Math.round(marketCap),
      sharesOutstanding: Math.round(marketCap / price),
      peRatio: round2(range(rand, 9, 45)),
      pegRatio: round2(range(rand, 0.6, 3)),
      priceToSales: round2(range(rand, 1, 12)),
      priceToBook: round2(range(rand, 1.5, 15)),
      evToEbitda: round2(range(rand, 7, 28)),
      roe: round4(range(rand, 0.05, 0.4)),
      roic: round4(range(rand, 0.04, 0.28)),
      grossMargin: round4(range(rand, 0.25, 0.68)),
      operatingMargin: round4(range(rand, 0.08, 0.34)),
      netMargin: round4(range(rand, 0.05, 0.26)),
      eps: round2(range(rand, 1, 14)),
      revenueGrowthYoY: round4(range(rand, -0.05, 0.22)),
      epsGrowthYoY: round4(range(rand, -0.1, 0.3)),
      revenueGrowth3yCagr: round4(range(rand, -0.02, 0.18)),
      epsGrowth3yCagr: round4(range(rand, -0.05, 0.25)),
      freeCashFlow: Math.round(marketCap * range(rand, -0.01, 0.06)),
      totalDebt: Math.round(marketCap * range(rand, 0.05, 0.4)),
      cash: Math.round(marketCap * range(rand, 0.03, 0.25)),
      netDebtToEbitda: round2(range(rand, -1, 3.5)),
      currentRatio: round2(range(rand, 0.8, 2.4)),
      dividendYield: round4(range(rand, 0, 0.035)),
      payoutRatio: round4(range(rand, 0, 0.6)),
      buybackYield: round4(range(rand, 0, 0.03)),
      institutionalOwnershipPct: round4(range(rand, 0.4, 0.85)),
      insiderOwnershipPct: round4(range(rand, 0.001, 0.15)),
      insiderNetBuys3m: Math.round(range(rand, -200_000, 200_000)),
      beta: round2(range(rand, 0.6, 1.9)),
      week52High: round2(price * range(rand, 1.05, 1.4)),
      week52Low: round2(price * range(rand, 0.6, 0.95)),
      priceChange1M: round4(range(rand, -0.12, 0.12)),
      priceChange3M: round4(range(rand, -0.2, 0.2)),
      priceChange6M: round4(range(rand, -0.28, 0.3)),
      priceChange12M: round4(range(rand, -0.35, 0.45)),
    };
  }

  async getPriceHistory(ticker: string, priceRange: PriceRange): Promise<PriceBar[]> {
    const rand = mulberry32(seedFromTicker(ticker + priceRange));
    const days = daysForRange(priceRange);
    const bars: PriceBar[] = [];
    let price = range(rand, 50, 400);
    const now = Date.now();
    for (let i = days; i >= 0; i--) {
      const drift = range(rand, -0.025, 0.027);
      price = Math.max(1, price * (1 + drift));
      const open = price * (1 + range(rand, -0.008, 0.008));
      const high = Math.max(open, price) * (1 + range(rand, 0, 0.012));
      const low = Math.min(open, price) * (1 - range(rand, 0, 0.012));
      bars.push({
        t: new Date(now - i * 86_400_000).toISOString(),
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(price),
        volume: Math.round(range(rand, 2_000_000, 60_000_000)),
      });
    }
    return bars;
  }

  async getEarningsHistory(ticker: string): Promise<EarningsHistoryPoint[]> {
    const rand = mulberry32(seedFromTicker(ticker + "earnings"));
    const points: EarningsHistoryPoint[] = [];
    for (let i = 7; i >= 0; i--) {
      const epsEstimate = round2(range(rand, 0.8, 8));
      const surprise = range(rand, -0.15, 0.2);
      const epsActual = round2(epsEstimate * (1 + surprise));
      const revenueEstimate = Math.round(range(rand, 5_000_000_000, 90_000_000_000));
      points.push({
        fiscalPeriod: quarterLabel(i),
        reportDate: new Date(Date.now() - i * 91 * 86_400_000).toISOString().slice(0, 10),
        epsActual,
        epsEstimate,
        revenueActual: Math.round(revenueEstimate * (1 + surprise * 0.5)),
        revenueEstimate,
        surprisePct: round4(surprise),
      });
    }
    return points;
  }

  async getIndices(): Promise<IndexQuote[]> {
    const rand = mulberry32(42);
    return [
      { symbol: "SPX", name: "S&P 500", value: round2(range(rand, 5200, 5900)), changePct: round4(range(rand, -0.015, 0.015)) },
      { symbol: "NDX", name: "Nasdaq 100", value: round2(range(rand, 18000, 21000)), changePct: round4(range(rand, -0.02, 0.02)) },
      { symbol: "DJI", name: "Dow Jones", value: round2(range(rand, 38000, 42000)), changePct: round4(range(rand, -0.012, 0.012)) },
      { symbol: "SX5E", name: "Euro Stoxx 50", value: round2(range(rand, 4700, 5300)), changePct: round4(range(rand, -0.015, 0.015)) },
    ];
  }
}

function daysForRange(r: PriceRange): number {
  switch (r) {
    case "1D": return 1;
    case "5D": return 5;
    case "1M": return 30;
    case "6M": return 182;
    case "YTD": return 200;
    case "1Y": return 365;
    case "5Y": return 365 * 5;
    case "MAX": return 365 * 10;
  }
}

function quarterLabel(quartersAgo: number): string {
  const q = Math.floor((3 - quartersAgo) % 4 + 4) % 4;
  const year = 2026 - Math.floor(quartersAgo / 4);
  return `Q${q + 1} ${year}`;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}
