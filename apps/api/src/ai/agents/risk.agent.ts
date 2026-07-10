import type { AgentOutput, Company, CompanyScores, Fundamentals } from "@stockiq/shared-types";
import type { AiClient } from "../ai-client.interface";

const AGENT_OUTPUT_SCHEMA = {
  properties: {
    confidence: { type: "number", description: "0-100 confidence in this risk assessment given data completeness" },
    summary: { type: "string", description: "2-3 sentence summary of the key risks" },
    keyPoints: { type: "array", items: { type: "string" }, description: "3-5 concrete, data-grounded risk factors" },
    citedData: { type: "array", items: { type: "string" }, description: "Which specific fields/scores were used" },
  },
  required: ["confidence", "summary", "keyPoints", "citedData"],
};

export interface RiskAgentInput {
  company: Company;
  fundamentals: Fundamentals;
  scores: CompanyScores;
}

/** Reasons over leverage, volatility (beta), and the risk/financial-health
 * score breakdowns already computed by the deterministic scoring engine. */
export async function runRiskAgent(client: AiClient, input: RiskAgentInput): Promise<AgentOutput> {
  const { company, fundamentals, scores } = input;
  const riskBreakdown = scores.breakdowns.find((b) => b.category === "risk");
  const healthBreakdown = scores.breakdowns.find((b) => b.category === "financialHealth");

  const result = await client.callStructured<Omit<AgentOutput, "agent">>({
    system:
      "Eres un analista de riesgo de renta variable. Te centras en apalancamiento, volatilidad, liquidez y concentración de negocio. " +
      "Trabajas ÚNICAMENTE con los datos y puntuaciones que se te dan; nunca inventas cifras. Hablas siempre en términos de riesgo relativo, no de certezas.",
    user:
      `Evalúa el riesgo de ${company.name} (${company.ticker}), sector ${company.sector}.\n\n` +
      `Fundamentales relevantes: beta=${fundamentals.beta}, deuda neta/EBITDA=${fundamentals.netDebtToEbitda}, ratio corriente=${fundamentals.currentRatio}, margen operativo=${fundamentals.operatingMargin}.\n\n` +
      `Risk Score (0-100, mayor = menor riesgo): ${riskBreakdown?.value} -- ${riskBreakdown?.summary}\n` +
      `Financial Health Score: ${healthBreakdown?.value} -- ${healthBreakdown?.summary}`,
    toolName: "submit_risk_analysis",
    toolDescription: "Envía el análisis de riesgo estructurado",
    schema: AGENT_OUTPUT_SCHEMA,
  });
  return { agent: "risk", ...result };
}
