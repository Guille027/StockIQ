export const AI_CLIENT = Symbol("AI_CLIENT");

export class NoApiKeyError extends Error {
  constructor(envVar: string) {
    super(`${envVar} no configurada`);
  }
}

export interface StructuredCallParams {
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  /** Plain JSON-Schema-ish shape: { properties: {...}, required: [...] }.
   * Each concrete client translates this to whatever format its vendor's
   * structured-output feature expects. */
  schema: Record<string, unknown>;
}

/**
 * Every LLM backend (Gemini, Claude, ...) implements this single interface --
 * same "provider abstraction" pattern as MarketDataProvider. Agents and the
 * orchestrator depend only on this, never on a specific vendor's SDK/API
 * shape, so swapping the AI engine is a one-file change.
 */
export interface AiClient {
  readonly isConfigured: boolean;
  callStructured<T>(params: StructuredCallParams): Promise<T>;
}
