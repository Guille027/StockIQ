import type { AgentOutput, Company, Fundamentals } from "@stockiq/shared-types";
import { AnthropicClient } from "../anthropic.client";

const AGENT_OUTPUT_SCHEMA = {
  properties: {
    confidence: { type: "number", description: "0-100 confidence in this analysis given data completeness" },
    summary: { type: "string", description: "2-3 sentence summary of the fundamental picture" },
    keyPoints: { type: "array", items: { type: "string" }, description: "3-5 concrete, data-grounded bullet points" },
    citedData: { type: "array", items: { type: "string" }, description: "Which specific fields/numbers from the input were actually used" },
  },
  required: ["confidence", "summary", "keyPoints", "citedData"],
};

export interface FundamentalAgentInput {
  company: Company;
  fundamentals: Fundamentals;
}

/** Reasons purely over valuation, profitability, growth and balance-sheet
 * data. Never touches news or price momentum. */
export async function runFundamentalAgent(client: AnthropicClient, input: FundamentalAgentInput): Promise<AgentOutput> {
  const { company, fundamentals } = input;
  const result = await client.callStructured<Omit<AgentOutput, "agent">>({
    system:
      "Eres un analista fundamental de renta variable. Razonas ÚNICAMENTE a partir de los datos numéricos que se te proporcionan. " +
      "Nunca inventas cifras ni afirmas certezas sobre el futuro; hablas en términos de fortalezas, debilidades y probabilidades. " +
      "Nunca recomiendas comprar o vender explícitamente.",
    user: `Analiza los fundamentales de ${company.name} (${company.ticker}), sector ${company.sector}.\n\nDatos:\n${JSON.stringify(fundamentals, null, 2)}`,
    toolName: "submit_fundamental_analysis",
    toolDescription: "Envía el análisis fundamental estructurado",
    schema: AGENT_OUTPUT_SCHEMA,
  });
  return { agent: "fundamental", ...result };
}
