import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiClient, NoApiKeyError, StructuredCallParams } from "./ai-client.interface";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Google Gemini backed AiClient (https://ai.google.dev, free tier -- no
 * card required). Uses Gemini's native structured-output feature
 * (responseSchema + responseMimeType: "application/json"), which is
 * simpler than Claude's forced-tool-use trick: the model returns the JSON
 * directly, no tool-call parsing needed.
 */
@Injectable()
export class GeminiClient implements AiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("GEMINI_API_KEY") ?? "";
    this.model = config.get<string>("GEMINI_MODEL") ?? "gemini-2.5-flash";
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async callStructured<T>(params: StructuredCallParams): Promise<T> {
    if (!this.apiKey) throw new NoApiKeyError("GEMINI_API_KEY");

    const res = await fetch(`${BASE_URL}/${this.model}:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: params.system }] },
        contents: [{ role: "user", parts: [{ text: params.user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(params.schema as SchemaNode),
          // Extended "thinking" adds real latency (each report makes 4 of
          // these calls) for little quality gain on a task that's mostly
          // structured extraction/synthesis over data already provided --
          // disabled for speed.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini respondió ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      this.logger.error("Gemini no devolvió contenido estructurado");
      throw new Error("No se recibió salida estructurada del modelo");
    }
    return JSON.parse(text) as T;
  }
}

interface SchemaNode {
  type?: string;
  description?: string;
  enum?: string[];
  properties?: Record<string, SchemaNode>;
  required?: string[];
  items?: SchemaNode;
}

/**
 * Translates the plain JSON-Schema-ish shape agents write ({properties,
 * required}, type: "string"/"number"/"array"/"object") into Gemini's
 * OpenAPI-subset schema (uppercase type names). Schema-aware on purpose:
 * `properties` is a dict of schema nodes (its values get converted, the
 * dict itself never does) and `items` is a single nested schema node --
 * naively recursing into every object indiscriminately (as an earlier
 * version of this function did) stamps a bogus `type` onto containers like
 * `properties` and Gemini rejects the whole schema with a 400.
 */
function toGeminiSchema(node: SchemaNode): Record<string, unknown> {
  const out: Record<string, unknown> = {
    type: (node.type ?? (node.properties ? "object" : "string")).toUpperCase(),
  };
  if (node.description) out.description = node.description;
  if (node.enum) out.enum = node.enum;
  if (node.required) out.required = node.required;
  if (node.properties) {
    out.properties = Object.fromEntries(Object.entries(node.properties).map(([key, value]) => [key, toGeminiSchema(value)]));
  }
  if (node.items) out.items = toGeminiSchema(node.items);
  return out;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}
