import { describe, expect, it } from "vitest";
import type { Fundamentals } from "@stockiq/shared-types";
import { computeAllScores } from "../src/computeAllScores";

const highQualityCompany: Fundamentals = {
  ticker: "GOOD",
  asOf: "2026-07-10",
  price: 200,
  marketCap: 2_000_000_000_000,
  sharesOutstanding: 10_000_000_000,
  peRatio: 22,
  pegRatio: 1.2,
  priceToSales: 6,
  evToEbitda: 15,
  roe: 0.35,
  roic: 0.25,
  grossMargin: 0.6,
  operatingMargin: 0.3,
  netMargin: 0.22,
  eps: 9,
  revenueGrowthYoY: 0.18,
  epsGrowthYoY: 0.22,
  revenueGrowth3yCagr: 0.15,
  epsGrowth3yCagr: 0.2,
  freeCashFlow: 80_000_000_000,
  totalDebt: 20_000_000_000,
  cash: 60_000_000_000,
  netDebtToEbitda: -0.5,
  currentRatio: 1.8,
  dividendYield: 0.005,
  institutionalOwnershipPct: 0.7,
  insiderOwnershipPct: 0.03,
  insiderNetBuys3m: 50_000,
  beta: 1.0,
  week52High: 220,
  week52Low: 140,
  priceChange1M: 0.05,
  priceChange3M: 0.12,
  priceChange6M: 0.2,
  priceChange12M: 0.35,
};

const weakCompany: Fundamentals = {
  ticker: "WEAK",
  asOf: "2026-07-10",
  price: 10,
  marketCap: 50_000_000_000,
  sharesOutstanding: 5_000_000_000,
  peRatio: 55,
  pegRatio: 3.5,
  priceToSales: 12,
  evToEbitda: 30,
  roe: 0.02,
  roic: 0.01,
  grossMargin: 0.15,
  operatingMargin: 0.02,
  netMargin: 0.01,
  eps: 0.1,
  revenueGrowthYoY: -0.08,
  epsGrowthYoY: -0.15,
  revenueGrowth3yCagr: -0.03,
  epsGrowth3yCagr: -0.08,
  freeCashFlow: -1_000_000_000,
  totalDebt: 40_000_000_000,
  cash: 2_000_000_000,
  netDebtToEbitda: 4.5,
  currentRatio: 0.7,
  beta: 2.0,
  week52High: 25,
  week52Low: 9,
  priceChange1M: -0.1,
  priceChange3M: -0.2,
  priceChange6M: -0.25,
  priceChange12M: -0.35,
};

describe("computeAllScores", () => {
  it("scores a high-quality company clearly above a weak one", () => {
    const good = computeAllScores({ ticker: "GOOD", asOf: "2026-07-10", fundamentals: highQualityCompany });
    const weak = computeAllScores({ ticker: "WEAK", asOf: "2026-07-10", fundamentals: weakCompany });

    expect(good.globalScore).toBeGreaterThan(weak.globalScore);
    expect(good.globalScore - weak.globalScore).toBeGreaterThan(25);
  });

  it("keeps every score within 0-100 and provides an explanation", () => {
    const result = computeAllScores({ ticker: "GOOD", asOf: "2026-07-10", fundamentals: highQualityCompany });
    expect(result.breakdowns).toHaveLength(9);
    for (const breakdown of result.breakdowns) {
      expect(breakdown.value).toBeGreaterThanOrEqual(0);
      expect(breakdown.value).toBeLessThanOrEqual(100);
      expect(breakdown.summary.length).toBeGreaterThan(0);
    }
  });

  it("degrades gracefully to a neutral score when fundamentals are missing", () => {
    const sparse: Fundamentals = {
      ticker: "SPARSE",
      asOf: "2026-07-10",
      price: 50,
      marketCap: 1_000_000_000,
      sharesOutstanding: 20_000_000,
    };
    const result = computeAllScores({ ticker: "SPARSE", asOf: "2026-07-10", fundamentals: sparse });
    expect(result.globalScore).toBeGreaterThanOrEqual(0);
    expect(result.globalScore).toBeLessThanOrEqual(100);
  });

  it("boosts the news score with positive sentiment and important headlines", () => {
    const withGoodNews = computeAllScores({
      ticker: "GOOD",
      asOf: "2026-07-10",
      fundamentals: highQualityCompany,
      news: { avgSentiment: 0.6, importantPositiveCount: 3, importantNegativeCount: 0, totalRelevant: 5 },
    });
    const newsBreakdown = withGoodNews.breakdowns.find((b) => b.category === "news");
    expect(newsBreakdown?.value).toBeGreaterThan(50);
  });
});
