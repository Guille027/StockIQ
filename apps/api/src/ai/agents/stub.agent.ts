import type { AgentName, AgentOutput } from "@stockiq/shared-types";

/**
 * Placeholder for the Technical, Earnings and Macro agents planned for
 * phase 2 (see docs/ARCHITECTURE.md roadmap). Kept in the orchestrator's
 * agent list now so the pattern for adding a real agent later is obvious:
 * implement a `run<Name>Agent(client, input)` function with this same
 * `AgentOutput` shape (see fundamental.agent.ts / news.agent.ts /
 * risk.agent.ts) and swap it in inside orchestrator.service.ts.
 */
export function stubAgentOutput(agent: AgentName): AgentOutput {
  return {
    agent,
    confidence: 0,
    summary: `El agente ${agent} todavía no está implementado (fase 2).`,
    keyPoints: [],
    citedData: [],
  };
}
