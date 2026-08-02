import type { CoachFeedbackDto, EmotionalState, TradePlanInput } from "@stockiq/shared-types";
import type { AiClient } from "../ai/ai-client.interface";

const COACH_OUTPUT_SCHEMA = {
  properties: {
    followedPlan: { type: "boolean", description: "¿La ejecución respetó el plan que el usuario escribió antes de operar?" },
    planAdherence: { type: "string", description: "2-3 frases comparando lo que el usuario dijo que haría con lo que hizo" },
    emotionalRead: { type: "string", description: "1-2 frases sobre cómo el estado emocional declarado pudo influir en la decisión" },
    strengths: { type: "array", items: { type: "string" }, description: "2-3 cosas que el usuario hizo bien EN EL PROCESO (no en el resultado)" },
    improvements: { type: "array", items: { type: "string" }, description: "2-3 mejoras concretas y amables para la próxima vez" },
    suggestedLessonIds: { type: "array", items: { type: "string" }, description: "0-2 ids de lección de la lista dada que ayudarían" },
    question: { type: "string", description: "UNA pregunta socrática final que haga pensar al usuario" },
  },
  required: ["followedPlan", "planAdherence", "emotionalRead", "strengths", "improvements", "suggestedLessonIds", "question"],
};

export interface CoachTradeInput {
  ticker: string;
  side: "buy" | "sell";
  plan: TradePlanInput;
  emotion: EmotionalState;
  entryContext: {
    quantity: number;
    price: number;
    realizedPnlPct?: number;
    holdingDays?: number;
    avgCostAtSale?: number;
  };
  reflection?: string;
  /** Valid lesson ids the coach may suggest, with titles for context. */
  availableLessons: { id: string; title: string }[];
}

/** Aggregate input for the daily period review -- behavior patterns, not a single execution. */
export interface CoachPeriodInput {
  tradeCount: number;
  emotions: string[];
  avgPositionPct: number;
  tradesWithoutStop: number;
  realizedResults: string[];
  availableLessons: { id: string; title: string }[];
}

const SYSTEM_PROMPT =
  "Eres un mentor de inversión en español. Tu único objetivo es que el usuario aprenda a pensar por sí mismo.\n" +
  "Reglas inquebrantables:\n" +
  "- NUNCA juzgas ni ridiculizas: eres amable, directo y constructivo, como un buen entrenador.\n" +
  "- NUNCA recomiendas comprar o vender nada, ni opinas sobre si una empresa es buena inversión.\n" +
  "- Analizas el PROCESO, no el resultado: una operación ganadora con mal proceso merece aviso, y una perdedora con buen proceso merece reconocimiento.\n" +
  "- Trabajas SOLO con los datos que se te dan; no inventas precios, fechas ni hechos.\n" +
  "- Detectas patrones peligrosos: operar por FOMO/euforia/venganza, ignorar el propio stop, tamaños de posición excesivos, vender ganadores demasiado pronto, dejar correr las pérdidas.\n" +
  "- Terminas SIEMPRE con una única pregunta socrática que invite a reflexionar.\n" +
  "- Si sugieres lecciones, usa únicamente ids de la lista proporcionada.";

/**
 * The coach agent: critiques a completed trade against the user's OWN plan.
 * Same shape as the other agents (plain function over AiClient) so it reuses
 * the Gemini/Anthropic clients and their mock story unchanged.
 */
export async function runCoachAgent(client: AiClient, input: CoachTradeInput): Promise<Omit<CoachFeedbackDto, "isMock">> {
  const { plan, entryContext: ctx } = input;
  const lessonList = input.availableLessons.map((l) => `${l.id}: ${l.title}`).join("\n");

  return client.callStructured<Omit<CoachFeedbackDto, "isMock">>({
    system: SYSTEM_PROMPT,
    user:
      `Operación cerrada de ${input.ticker} (${input.side === "sell" ? "venta" : "compra"}).\n\n` +
      `EL PLAN QUE ESCRIBIÓ EL USUARIO ANTES DE OPERAR:\n` +
      `- Por qué: ${plan.reason}\n` +
      `- Qué esperaba: ${plan.expectation}\n` +
      `- Riesgo que veía: ${plan.riskNoted}\n` +
      `- Salida si se equivocaba: ${plan.exitPlan}\n` +
      `- Stop declarado: ${plan.stopPrice !== undefined ? `$${plan.stopPrice}` : "no definió"}\n` +
      `- Tamaño: ${plan.portfolioPct.toFixed(1)}% de la cartera\n` +
      `- Estado emocional al operar: ${input.emotion}\n\n` +
      `LO QUE PASÓ:\n` +
      `- Ejecución: ${ctx.quantity} acciones a $${ctx.price.toFixed(2)}\n` +
      (ctx.avgCostAtSale !== undefined ? `- Coste medio de la posición vendida: $${ctx.avgCostAtSale.toFixed(2)}\n` : "") +
      (ctx.realizedPnlPct !== undefined ? `- Resultado realizado: ${(ctx.realizedPnlPct * 100).toFixed(2)}%\n` : "") +
      (ctx.holdingDays !== undefined ? `- Días manteniendo la posición: ${ctx.holdingDays}\n` : "") +
      (input.reflection ? `\nREFLEXIÓN POSTERIOR DEL USUARIO:\n${input.reflection}\n` : "") +
      `\nLECCIONES DISPONIBLES PARA SUGERIR (usa solo estos ids):\n${lessonList}`,
    toolName: "submit_coach_feedback",
    toolDescription: "Envía el feedback estructurado del mentor sobre esta operación",
    schema: COACH_OUTPUT_SCHEMA,
  });
}

/** Period review: pattern analysis over the recent set of planned trades. */
export async function runCoachPeriodAgent(client: AiClient, input: CoachPeriodInput): Promise<Omit<CoachFeedbackDto, "isMock">> {
  const lessonList = input.availableLessons.map((l) => `${l.id}: ${l.title}`).join("\n");
  return client.callStructured<Omit<CoachFeedbackDto, "isMock">>({
    system: SYSTEM_PROMPT,
    user:
      `Revisión de periodo: analiza los PATRONES de comportamiento del usuario en sus últimas ${input.tradeCount} operaciones con plan (no hay una operación concreta que evaluar; followedPlan aquí significa "en general respeta sus planes").\n\n` +
      `DATOS AGREGADOS:\n` +
      `- Emociones declaradas al operar: ${input.emotions.join(", ")}\n` +
      `- Tamaño medio de posición: ${input.avgPositionPct.toFixed(1)}% de la cartera\n` +
      `- Operaciones sin stop definido: ${input.tradesWithoutStop}/${input.tradeCount}\n` +
      `- Resultados realizados en ventas: ${input.realizedResults.length ? input.realizedResults.join(", ") : "ninguna venta cerrada todavía"}\n\n` +
      `Busca patrones repetidos (emociones dominantes, disciplina con stops, tamaños), reconoce lo que hace bien y sugiere una mejora de hábito concreta.\n\n` +
      `LECCIONES DISPONIBLES PARA SUGERIR (usa solo estos ids):\n${lessonList}`,
    toolName: "submit_coach_feedback",
    toolDescription: "Envía la revisión de periodo estructurada del mentor",
    schema: COACH_OUTPUT_SCHEMA,
  });
}

/**
 * Deterministic fallback when no AI key is configured -- clearly labeled
 * isMock upstream, same pattern as the orchestrator's mock report. Still
 * genuinely useful: it applies simple rules to the plan itself.
 */
export function buildMockPeriodFeedback(input: CoachPeriodInput): Omit<CoachFeedbackDto, "isMock"> {
  const improvements: string[] = [];
  if (input.tradesWithoutStop > 0) {
    improvements.push(`En ${input.tradesWithoutStop} de ${input.tradeCount} operaciones no definiste stop numérico -- conviértelo en un hábito.`);
  }
  if (input.avgPositionPct > 15) {
    improvements.push(`Tu posición media es del ${input.avgPositionPct.toFixed(0)}% de la cartera: revisa si esa concentración es una decisión o una costumbre.`);
  }
  if (improvements.length === 0) improvements.push("Sigue así: planes completos y tamaños razonables. El siguiente paso es reflexionar por escrito tras cada venta.");

  return {
    followedPlan: input.tradesWithoutStop < input.tradeCount / 2,
    planAdherence: `Revisión de ejemplo (sin clave de IA) sobre tus últimas ${input.tradeCount} operaciones con plan. Con GEMINI_API_KEY configurada, esta revisión será personalizada.`,
    emotionalRead: `Emociones que más declaraste: ${input.emotions.slice(0, 3).join(", ") || "n/d"}.`,
    strengths: ["Todas tus operaciones tienen un plan escrito -- esa es la base de todo lo demás."],
    improvements,
    suggestedLessonIds: [],
    question: "De tus últimas operaciones, ¿cuál repetirías exactamente igual aunque hubiera salido mal? ¿Por qué?",
  };
}

export function buildMockCoachFeedback(input: CoachTradeInput): Omit<CoachFeedbackDto, "isMock"> {
  const risky = ["fomo", "euforia", "venganza"].includes(input.emotion);
  const noStop = input.plan.stopPrice === undefined;
  const big = input.plan.portfolioPct > 20;

  const improvements: string[] = [];
  if (noStop) improvements.push("Define un stop numérico antes de entrar: 'saldré si baja' sin cifra es fácil de incumplir.");
  if (big) improvements.push(`Usaste el ${input.plan.portfolioPct.toFixed(0)}% de la cartera en una sola posición -- piensa qué pasaría si sale mal.`);
  if (risky) improvements.push(`Operaste sintiendo ${input.emotion}: espera 24h la próxima vez que notes esa emoción y revisa si el plan sigue teniendo sentido.`);
  if (improvements.length === 0) improvements.push("Sigue documentando cada operación igual de bien; con más historial, el análisis será más fino.");

  return {
    followedPlan: !risky,
    planAdherence: "Análisis de ejemplo (sin clave de IA configurada): comparamos tu ejecución con el plan que escribiste. Con GEMINI_API_KEY configurada, este análisis será personalizado.",
    emotionalRead: risky
      ? `Declaraste ${input.emotion} al operar -- es la emoción que más operaciones impulsivas provoca.`
      : `Declaraste ${input.emotion} al operar, un buen punto de partida para decidir con la cabeza.`,
    strengths: ["Escribiste un plan completo antes de operar -- eso ya te pone por delante de la mayoría.", "Definiste el riesgo que veías antes de entrar."],
    improvements,
    suggestedLessonIds: [],
    question: "Si el precio no se moviera nada durante un mes, ¿seguirías queriendo esta posición? ¿Por qué?",
  };
}
