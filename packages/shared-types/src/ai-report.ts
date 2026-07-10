export type AgentName =
  | "fundamental"
  | "technical"
  | "news"
  | "risk"
  | "earnings"
  | "macro";

/** Structured output of a single specialized agent. Grounded strictly in the
 * data it was given -- never invents figures. */
export interface AgentOutput {
  agent: AgentName;
  /** 0-100 how confident the agent is in its own read, given data completeness */
  confidence: number;
  summary: string;
  keyPoints: string[];
  /** IDs/labels of the data points this agent actually used, for traceability */
  citedData: string[];
}

/** Final report produced by the orchestrator after combining all agent outputs. */
export interface AiReport {
  ticker: string;
  generatedAt: string;
  isMock: boolean; // true when generated without a live ANTHROPIC_API_KEY

  businessSummary: string;
  howItMakesMoney: string;
  financialSituation: string;
  valuation: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  positiveCatalysts: string[];
  negativeCatalysts: string[];
  recentNewsSummary: string;
  pastEarningsSummary: string;
  marketExpectations: string;

  /** 0-100, how confident the orchestrator is in this report overall */
  aiConfidenceScore: number;

  agentOutputs: AgentOutput[];
}

export interface DailyMarketSummary {
  date: string;
  headline: string;
  body: string;
  isMock: boolean;
}
