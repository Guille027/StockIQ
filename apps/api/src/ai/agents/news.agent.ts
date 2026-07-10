import type { AgentOutput, Company, NewsItem } from "@stockiq/shared-types";
import { AnthropicClient } from "../anthropic.client";

const AGENT_OUTPUT_SCHEMA = {
  properties: {
    confidence: { type: "number", description: "0-100 confidence given how much recent, relevant news is available" },
    summary: { type: "string", description: "2-3 sentence summary of the recent news flow and its likely relevance" },
    keyPoints: { type: "array", items: { type: "string" }, description: "3-5 concrete points, each tied to a specific headline" },
    citedData: { type: "array", items: { type: "string" }, description: "Headlines actually used in the analysis" },
  },
  required: ["confidence", "summary", "keyPoints", "citedData"],
};

export interface NewsAgentInput {
  company: Company;
  news: NewsItem[];
}

/** Reasons purely over recent news headlines/summaries -- never fabricates
 * a headline that wasn't provided. */
export async function runNewsAgent(client: AnthropicClient, input: NewsAgentInput): Promise<AgentOutput> {
  const { company, news } = input;
  if (news.length === 0) {
    return {
      agent: "news",
      confidence: 20,
      summary: `No hay noticias recientes relevantes disponibles para ${company.name}.`,
      keyPoints: [],
      citedData: [],
    };
  }
  const result = await client.callStructured<Omit<AgentOutput, "agent">>({
    system:
      "Eres un analista de noticias financieras. Trabajas ÚNICAMENTE con los titulares y resúmenes que se te dan, nunca inventas noticias. " +
      "Explicas el posible impacto en el precio de forma prudente, en términos de probabilidad, no de certeza.",
    user: `Analiza las noticias recientes de ${company.name} (${company.ticker}):\n\n${news
      .map((n) => `- [${n.sentiment}, importancia ${n.importance}] ${n.headline}: ${n.summary}`)
      .join("\n")}`,
    toolName: "submit_news_analysis",
    toolDescription: "Envía el análisis de noticias estructurado",
    schema: AGENT_OUTPUT_SCHEMA,
  });
  return { agent: "news", ...result };
}
