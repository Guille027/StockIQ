import { Injectable, Logger } from "@nestjs/common";
import type { AgentOutput, AiReport, Company, CompanyScores, Fundamentals, NewsItem } from "@stockiq/shared-types";
import { AnthropicClient, NoApiKeyError } from "./anthropic.client";
import { runFundamentalAgent } from "./agents/fundamental.agent";
import { runNewsAgent } from "./agents/news.agent";
import { runRiskAgent } from "./agents/risk.agent";
import { stubAgentOutput } from "./agents/stub.agent";

const FINAL_REPORT_SCHEMA = {
  properties: {
    businessSummary: { type: "string" },
    howItMakesMoney: { type: "string" },
    financialSituation: { type: "string" },
    valuation: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    positiveCatalysts: { type: "array", items: { type: "string" } },
    negativeCatalysts: { type: "array", items: { type: "string" } },
    recentNewsSummary: { type: "string" },
    pastEarningsSummary: { type: "string" },
    marketExpectations: { type: "string" },
  },
  required: [
    "businessSummary", "howItMakesMoney", "financialSituation", "valuation",
    "strengths", "weaknesses", "risks", "positiveCatalysts", "negativeCatalysts",
    "recentNewsSummary", "pastEarningsSummary", "marketExpectations",
  ],
};

export interface OrchestratorInput {
  company: Company;
  fundamentals: Fundamentals;
  scores: CompanyScores;
  news: NewsItem[];
}

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(private readonly client: AnthropicClient) {}

  async generateReport(input: OrchestratorInput): Promise<AiReport> {
    if (!this.client.isConfigured) {
      return this.buildMockReport(input);
    }

    try {
      const [fundamental, news, risk] = await Promise.all([
        runFundamentalAgent(this.client, { company: input.company, fundamentals: input.fundamentals }),
        runNewsAgent(this.client, { company: input.company, news: input.news }),
        runRiskAgent(this.client, { company: input.company, fundamentals: input.fundamentals, scores: input.scores }),
      ]);
      const stubs = [stubAgentOutput("technical"), stubAgentOutput("earnings"), stubAgentOutput("macro")];
      const agentOutputs = [fundamental, news, risk, ...stubs];

      const synthesis = await this.client.callStructured<Omit<AiReport, "ticker" | "generatedAt" | "isMock" | "agentOutputs" | "aiConfidenceScore">>({
        system:
          "Eres el orquestador de un equipo de analistas de renta variable. Recibes los análisis ya elaborados por agentes especializados " +
          "(fundamental, noticias, riesgo) y debes combinarlos en un informe único, coherente y bien fundamentado. " +
          "NUNCA inventas datos que no aparezcan en los análisis recibidos. Nunca dices 'compra' o 'vende'. Hablas siempre en términos de " +
          "probabilidad y riesgo, no de certezas sobre el futuro.",
        user:
          `Empresa: ${input.company.name} (${input.company.ticker}), sector ${input.company.sector}.\n\n` +
          `Score global: ${input.scores.globalScore}/100.\n\n` +
          `Análisis del Agente Fundamental (confianza ${fundamental.confidence}): ${fundamental.summary}\nPuntos: ${fundamental.keyPoints.join(" | ")}\n\n` +
          `Análisis del Agente de Noticias (confianza ${news.confidence}): ${news.summary}\nPuntos: ${news.keyPoints.join(" | ")}\n\n` +
          `Análisis del Agente de Riesgo (confianza ${risk.confidence}): ${risk.summary}\nPuntos: ${risk.keyPoints.join(" | ")}\n\n` +
          `Redacta el informe final combinando estos análisis.`,
        toolName: "submit_final_report",
        toolDescription: "Envía el informe final combinado",
        schema: FINAL_REPORT_SCHEMA,
      });

      const aiConfidenceScore = Math.round((fundamental.confidence + news.confidence + risk.confidence) / 3);

      return {
        ticker: input.company.ticker,
        generatedAt: new Date().toISOString(),
        isMock: false,
        aiConfidenceScore,
        agentOutputs,
        ...synthesis,
      };
    } catch (err) {
      if (err instanceof NoApiKeyError) return this.buildMockReport(input);
      this.logger.error(`Fallo generando informe IA para ${input.company.ticker}: ${(err as Error).message}`);
      throw err;
    }
  }

  /** Deterministic, data-grounded placeholder report used whenever no
   * ANTHROPIC_API_KEY is configured. Clearly labeled isMock: true -- never
   * presented to the user as a real AI-generated analysis. */
  private buildMockReport(input: OrchestratorInput): AiReport {
    const { company, fundamentals, scores, news } = input;
    const agentOutputs: AgentOutput[] = [
      {
        agent: "fundamental",
        confidence: 40,
        summary: `[MOCK] Cuadro fundamental de ejemplo para ${company.name} basado en datos simulados.`,
        keyPoints: [`PER simulado: ${fundamentals.peRatio}`, `ROE simulado: ${fundamentals.roe}`],
        citedData: ["peRatio", "roe"],
      },
      {
        agent: "news",
        confidence: news.length ? 40 : 15,
        summary: `[MOCK] ${news.length} noticias de ejemplo analizadas.`,
        keyPoints: news.slice(0, 3).map((n) => n.headline),
        citedData: news.map((n) => n.id),
      },
      {
        agent: "risk",
        confidence: 40,
        summary: `[MOCK] Riesgo simulado a partir del Risk Score (${scores.breakdowns.find((b) => b.category === "risk")?.value}).`,
        keyPoints: [`Beta simulada: ${fundamentals.beta}`, `Deuda neta/EBITDA simulada: ${fundamentals.netDebtToEbitda}`],
        citedData: ["beta", "netDebtToEbitda"],
      },
      stubAgentOutput("technical"),
      stubAgentOutput("earnings"),
      stubAgentOutput("macro"),
    ];

    return {
      ticker: company.ticker,
      generatedAt: new Date().toISOString(),
      isMock: true,
      businessSummary: `[MOCK] ${company.name} opera en el sector ${company.sector} (${company.industry}). Este resumen usa datos de ejemplo -- añade ANTHROPIC_API_KEY y FINNHUB_API_KEY para un informe real.`,
      howItMakesMoney: `[MOCK] Información real sobre el modelo de negocio de ${company.name} requiere datos reales; esta es una plantilla de ejemplo.`,
      financialSituation: `[MOCK] Con datos simulados, ${company.name} presenta un margen operativo del ${((fundamentals.operatingMargin ?? 0) * 100).toFixed(1)}% y deuda neta/EBITDA de ${fundamentals.netDebtToEbitda}.`,
      valuation: `[MOCK] PER simulado de ${fundamentals.peRatio} frente a un PEG simulado de ${fundamentals.pegRatio}.`,
      strengths: ["[MOCK] Fortaleza de ejemplo 1", "[MOCK] Fortaleza de ejemplo 2"],
      weaknesses: ["[MOCK] Debilidad de ejemplo 1"],
      risks: ["[MOCK] Riesgo de ejemplo asociado a apalancamiento simulado"],
      positiveCatalysts: ["[MOCK] Catalizador positivo de ejemplo"],
      negativeCatalysts: ["[MOCK] Catalizador negativo de ejemplo"],
      recentNewsSummary: news.length ? `[MOCK] ${news[0]?.headline}` : "[MOCK] Sin noticias recientes simuladas.",
      pastEarningsSummary: "[MOCK] Histórico de resultados simulado, ver pestaña Financiero.",
      marketExpectations: "[MOCK] Expectativas del mercado simuladas -- configura las API keys para un análisis real.",
      aiConfidenceScore: 35,
      agentOutputs,
    };
  }
}
