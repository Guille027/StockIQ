import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import { AiClient, NoApiKeyError, StructuredCallParams } from "./ai-client.interface";

/**
 * Thin wrapper around @anthropic-ai/sdk that forces structured JSON output
 * via a single forced tool call. Paid (no free tier) -- Gemini is the
 * default AI engine (see gemini.client.ts); this is kept as an opt-in
 * alternative behind the same AiClient interface for anyone who'd rather
 * pay for Claude's quality. Wire it in via ai.module.ts's AI_CLIENT factory.
 */
@Injectable()
export class AnthropicClient implements AiClient {
  private readonly logger = new Logger(AnthropicClient.name);
  private readonly client: Anthropic | null;
  private readonly model: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>("ANTHROPIC_API_KEY");
    this.model = config.get<string>("ANTHROPIC_MODEL") ?? "claude-sonnet-5";
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async callStructured<T>(params: StructuredCallParams): Promise<T> {
    if (!this.client) throw new NoApiKeyError("ANTHROPIC_API_KEY");

    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      system: params.system,
      messages: [{ role: "user", content: params.user }],
      tools: [
        {
          name: params.toolName,
          description: params.toolDescription,
          input_schema: {
            type: "object",
            ...params.schema,
          },
        },
      ],
      tool_choice: { type: "tool", name: params.toolName },
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      this.logger.error("El modelo no devolvió una salida de herramienta estructurada");
      throw new Error("No se recibió salida estructurada del modelo");
    }
    return toolUse.input as T;
  }
}
