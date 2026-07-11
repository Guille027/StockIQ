import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { CompetitorComparison, PriceRange } from "@stockiq/shared-types";
import { getCompany, getSectors, isInUniverse, UNIVERSE } from "@stockiq/universe";
import { MarketDataService } from "../market-data/market-data.service";
import { ScoringService } from "../scoring/scoring.service";

const VALID_RANGES: PriceRange[] = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"];

@ApiTags("companies")
@Controller("companies")
export class CompaniesController {
  constructor(
    private readonly marketData: MarketDataService,
    private readonly scoring: ScoringService,
  ) {}

  @Get()
  async list(@Query("sector") sector?: string, @Query("search") search?: string) {
    let companies = UNIVERSE;
    if (sector) companies = companies.filter((c) => c.sector.toLowerCase() === sector.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      companies = companies.filter((c) => c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q));
    }

    const rows = await Promise.all(
      companies.map(async (c) => {
        const fundamentals = await this.marketData.getFundamentals(c.ticker);
        return {
          ticker: c.ticker,
          name: c.name,
          sector: c.sector,
          price: fundamentals.price,
          marketCap: fundamentals.marketCap,
          peRatio: fundamentals.peRatio,
        };
      }),
    );

    return { isMock: this.marketData.isMock, sectors: getSectors(), count: rows.length, companies: rows };
  }

  /** Lightweight ticker/name search for autocomplete pickers (e.g. the Paper
   * Trading buy/sell form) -- filters the static universe list directly,
   * no market-data calls, so it stays instant even on a cold cache. Must
   * be declared before `:ticker` or Nest would try to match "search" as a
   * ticker param. */
  @Get("search")
  search(@Query("q") q?: string, @Query("limit") limit?: string) {
    const query = (q ?? "").trim().toLowerCase();
    const max = Math.min(Number(limit) || 15, 50);
    if (!query) {
      return { results: UNIVERSE.slice(0, max).map(({ ticker, name, sector }) => ({ ticker, name, sector })) };
    }

    const scored = UNIVERSE.map((c) => {
      const ticker = c.ticker.toLowerCase();
      const name = c.name.toLowerCase();
      let score = 4;
      if (ticker === query) score = 0;
      else if (ticker.startsWith(query)) score = 1;
      else if (name.split(/\s+/).some((word) => word.startsWith(query))) score = 2;
      else if (ticker.includes(query) || name.includes(query)) score = 3;
      return { c, score };
    }).filter((r) => r.score < 4);

    scored.sort((a, b) => a.score - b.score || a.c.ticker.localeCompare(b.c.ticker));

    return { results: scored.slice(0, max).map(({ c }) => ({ ticker: c.ticker, name: c.name, sector: c.sector })) };
  }

  @Get(":ticker")
  async getProfile(@Param("ticker") tickerParam: string) {
    const ticker = tickerParam.toUpperCase();
    this.assertInUniverse(ticker);
    const company = getCompany(ticker)!;

    const [fundamentals, scores, priceHistory, competitors] = await Promise.all([
      this.marketData.getFundamentals(ticker),
      this.scoring.getScores(ticker),
      this.marketData.getPriceHistory(ticker, "6M"),
      this.getCompetitors(ticker),
    ]);

    return {
      isMock: this.marketData.isMock,
      company,
      fundamentals,
      scores,
      priceHistory,
      competitors,
    };
  }

  @Get(":ticker/scores")
  async getScores(@Param("ticker") tickerParam: string) {
    const ticker = tickerParam.toUpperCase();
    this.assertInUniverse(ticker);
    return this.scoring.getScores(ticker);
  }

  @Get(":ticker/price-history")
  async getPriceHistory(@Param("ticker") tickerParam: string, @Query("range") range?: string) {
    const ticker = tickerParam.toUpperCase();
    this.assertInUniverse(ticker);
    const r = (range?.toUpperCase() ?? "6M") as PriceRange;
    if (!VALID_RANGES.includes(r)) {
      throw new BadRequestException(`Rango inválido. Usa uno de: ${VALID_RANGES.join(", ")}`);
    }
    const bars = await this.marketData.getPriceHistory(ticker, r);
    return { isMock: this.marketData.isMock, range: r, bars };
  }

  @Get(":ticker/earnings-history")
  async getEarningsHistory(@Param("ticker") tickerParam: string) {
    const ticker = tickerParam.toUpperCase();
    this.assertInUniverse(ticker);
    const history = await this.marketData.getEarningsHistory(ticker);
    return { isMock: this.marketData.isMock, history };
  }

  @Get(":ticker/competitors")
  async getCompetitorsRoute(@Param("ticker") tickerParam: string) {
    const ticker = tickerParam.toUpperCase();
    this.assertInUniverse(ticker);
    return { competitors: await this.getCompetitors(ticker) };
  }

  private async getCompetitors(ticker: string): Promise<CompetitorComparison[]> {
    const company = getCompany(ticker)!;
    const peers = UNIVERSE.filter((c) => c.sector === company.sector && c.ticker !== ticker).slice(0, 4);
    return Promise.all(
      peers.map(async (peer) => {
        const [fundamentals, scores] = await Promise.all([this.marketData.getFundamentals(peer.ticker), this.scoring.getScores(peer.ticker)]);
        return {
          ticker: peer.ticker,
          name: peer.name,
          peRatio: fundamentals.peRatio,
          roe: fundamentals.roe,
          revenueGrowthYoY: fundamentals.revenueGrowthYoY,
          marketCap: fundamentals.marketCap,
          globalScore: scores.globalScore,
        };
      }),
    );
  }

  private assertInUniverse(ticker: string) {
    if (!isInUniverse(ticker)) {
      throw new NotFoundException(
        `${ticker} no pertenece al universo de inversión de StockIQ (solo grandes empresas líquidas -- sin ETFs, cripto, forex ni penny stocks).`,
      );
    }
  }
}
