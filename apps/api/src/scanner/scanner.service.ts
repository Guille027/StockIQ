import { Injectable } from "@nestjs/common";
import type { ScannerFilter, ScannerResultRow } from "@stockiq/shared-types";
import { getCompany } from "@stockiq/universe";
import { MarketDataService } from "../market-data/market-data.service";
import { ScoringService } from "../scoring/scoring.service";

@Injectable()
export class ScannerService {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly scoring: ScoringService,
  ) {}

  async run(filter: ScannerFilter): Promise<ScannerResultRow[]> {
    const snapshot = await this.scoring.getUniverseSnapshot();
    const rows: ScannerResultRow[] = [];

    for (const scores of snapshot) {
      const company = getCompany(scores.ticker);
      if (!company) continue;
      if (filter.sectors?.length && !filter.sectors.includes(company.sector)) continue;
      if (filter.minGlobalScore !== undefined && scores.globalScore < filter.minGlobalScore) continue;

      const fundamentals = await this.marketData.getFundamentals(scores.ticker);
      const matched: string[] = [];

      if (filter.peMax !== undefined) {
        if (fundamentals.peRatio === undefined || fundamentals.peRatio > filter.peMax) continue;
        matched.push(`PER ≤ ${filter.peMax}`);
      }
      if (filter.roeMin !== undefined) {
        if (fundamentals.roe === undefined || fundamentals.roe < filter.roeMin) continue;
        matched.push(`ROE ≥ ${(filter.roeMin * 100).toFixed(0)}%`);
      }
      if (filter.roicMin !== undefined) {
        if (fundamentals.roic === undefined || fundamentals.roic < filter.roicMin) continue;
        matched.push(`ROIC ≥ ${(filter.roicMin * 100).toFixed(0)}%`);
      }
      if (filter.revenueGrowthMin !== undefined) {
        if (fundamentals.revenueGrowthYoY === undefined || fundamentals.revenueGrowthYoY < filter.revenueGrowthMin) continue;
        matched.push(`Crecimiento ingresos ≥ ${(filter.revenueGrowthMin * 100).toFixed(0)}%`);
      }
      if (filter.epsGrowthMin !== undefined) {
        if (fundamentals.epsGrowthYoY === undefined || fundamentals.epsGrowthYoY < filter.epsGrowthMin) continue;
        matched.push(`Crecimiento BPA ≥ ${(filter.epsGrowthMin * 100).toFixed(0)}%`);
      }
      if (filter.operatingMarginMin !== undefined) {
        if (fundamentals.operatingMargin === undefined || fundamentals.operatingMargin < filter.operatingMarginMin) continue;
        matched.push(`Margen operativo ≥ ${(filter.operatingMarginMin * 100).toFixed(0)}%`);
      }
      if (filter.marketCapMin !== undefined) {
        if (fundamentals.marketCap < filter.marketCapMin) continue;
        matched.push(`Cap. de mercado ≥ ${filter.marketCapMin.toLocaleString()}`);
      }
      if (filter.insiderBuyingOnly) {
        if (fundamentals.insiderNetBuys3m === undefined || fundamentals.insiderNetBuys3m <= 0) continue;
        matched.push("Insider buying neto positivo (3m)");
      }
      if (filter.positiveNewsOnly) {
        const newsScore = scores.breakdowns.find((b) => b.category === "news")?.value ?? 50;
        if (newsScore < 60) continue;
        matched.push("Flujo de noticias positivo");
      }
      // NOTE: `upcomingEarningsWithinDays` needs the earnings calendar module
      // (phase 2, see docs/ARCHITECTURE.md) and is not yet applied here.

      rows.push({
        ticker: company.ticker,
        name: company.name,
        sector: company.sector,
        price: fundamentals.price,
        marketCap: fundamentals.marketCap,
        peRatio: fundamentals.peRatio,
        roe: fundamentals.roe,
        revenueGrowthYoY: fundamentals.revenueGrowthYoY,
        globalScore: scores.globalScore,
        matchedFilters: matched,
      });
    }

    return rows.sort((a, b) => b.globalScore - a.globalScore);
  }
}
