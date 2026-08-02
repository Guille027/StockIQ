import { Inject, Injectable } from "@nestjs/common";
import type { AiReport, DailyMarketSummary, IndexQuote, ScoreChange } from "@stockiq/shared-types";
import { getCompany, isInUniverse } from "@stockiq/universe";
import { NotFoundException } from "@nestjs/common";
import { CacheService } from "../common/cache/cache.service";
import { MarketDataService } from "../market-data/market-data.service";
import { NewsService } from "../news/news.service";
import { ScoringService } from "../scoring/scoring.service";
import { AI_CLIENT, AiClient } from "./ai-client.interface";
import { OrchestratorService } from "./orchestrator.service";

const AI_REPORT_TTL_SECONDS = 12 * 60 * 60; // 12h
const DAILY_SUMMARY_TTL_SECONDS = 6 * 60 * 60; // 6h

@Injectable()
export class AiService {
  constructor(
    private readonly cache: CacheService,
    private readonly marketData: MarketDataService,
    private readonly scoring: ScoringService,
    private readonly news: NewsService,
    private readonly orchestrator: OrchestratorService,
    @Inject(AI_CLIENT) private readonly client: AiClient,
  ) {}

  getCachedReport(ticker: string): AiReport | undefined {
    return this.cache.get<AiReport>(`ai-report:${ticker}`);
  }

  async generateReport(tickerParam: string, forceRegenerate = false): Promise<AiReport> {
    const ticker = tickerParam.toUpperCase();
    if (!isInUniverse(ticker)) {
      throw new NotFoundException(`${ticker} no pertenece al universo de inversión de StockIQ.`);
    }
    if (!forceRegenerate) {
      const cached = this.getCachedReport(ticker);
      if (cached) return cached;
    }

    const company = getCompany(ticker)!;
    const [fundamentals, scores, news] = await Promise.all([
      this.marketData.getFundamentals(ticker),
      this.scoring.getScores(ticker),
      this.news.getForTicker(ticker, 10),
    ]);

    const report = await this.orchestrator.generateReport({ company, fundamentals, scores, news });
    this.cache.set(`ai-report:${ticker}`, report, AI_REPORT_TTL_SECONDS);
    return report;
  }

  async getDailySummary(): Promise<DailyMarketSummary> {
    return this.cache.wrap(`daily-summary:${new Date().toISOString().slice(0, 10)}`, DAILY_SUMMARY_TTL_SECONDS, async () => {
      const indices = await this.marketData.getIndices();
      const news = await this.news.getMarketNews(8);

      if (!this.client.isConfigured) {
        return this.buildMockDailySummary(indices);
      }

      try {
        const result = await this.client.callStructured<{ headline: string; body: string }>({
          system:
            "Eres el redactor de una plataforma EDUCATIVA de inversión. Con los índices y noticias dados, escribe un resumen diario breve que ayude " +
            "a un principiante a ENTENDER qué ha movido el mercado hoy y, si encaja con naturalidad, qué concepto de inversión ayuda a interpretarlo " +
            "(ej. 'esto es la rotación sectorial en acción'). Prohibido: presentar cualquier empresa como atractiva u oportunidad, sugerir compras o " +
            "ventas, y hacer predicciones. Nunca inventas cifras que no estén en los datos proporcionados.",
          user: `Índices:\n${JSON.stringify(indices)}\n\nNoticias destacadas:\n${news.map((n) => `- ${n.headline}`).join("\n")}`,
          toolName: "submit_daily_summary",
          toolDescription: "Envía el resumen diario del mercado",
          schema: {
            properties: {
              headline: { type: "string", description: "One-line headline for the day" },
              body: { type: "string", description: "3-5 sentence summary" },
            },
            required: ["headline", "body"],
          },
        });
        return { date: new Date().toISOString().slice(0, 10), isMock: false, ...result };
      } catch {
        return this.buildMockDailySummary(indices);
      }
    });
  }

  async getBiggestScoreChanges(): Promise<ScoreChange[]> {
    // Phase 1 has no historical score storage yet (see docs/ARCHITECTURE.md
    // roadmap), so this returns an empty list rather than fabricating deltas.
    return [];
  }

  private buildMockDailySummary(indices: IndexQuote[]): DailyMarketSummary {
    const spx = indices.find((i) => i.symbol === "SPX");
    return {
      date: new Date().toISOString().slice(0, 10),
      isMock: true,
      headline: "[MOCK] Resumen diario de ejemplo",
      body: `[MOCK] El S&P 500 se sitúa en ${spx?.value ?? "n/d"} (${((spx?.changePct ?? 0) * 100).toFixed(2)}% simulado). Configura GEMINI_API_KEY para un resumen real generado por IA.`,
    };
  }
}
