import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CURRICULUM } from "@stockiq/curriculum";
import type { CoachFeedbackDto, CoachFeedbackResponse, EmotionalState, TradePlanInput } from "@stockiq/shared-types";
import { AI_CLIENT, NoApiKeyError, type AiClient } from "../ai/ai-client.interface";
import { PrismaService } from "../common/prisma/prisma.service";
import { XpService } from "../profile/xp.service";
import {
  buildMockCoachFeedback,
  buildMockPeriodFeedback,
  runCoachAgent,
  runCoachPeriodAgent,
  type CoachPeriodInput,
  type CoachTradeInput,
} from "./coach.agent";

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
    @Inject(AI_CLIENT) private readonly client: AiClient,
  ) {}

  /**
   * Feedback for a closed (sell) trade. One Gemini call per trade EVER:
   * the result is cached permanently in CoachFeedback keyed (scope, refId).
   */
  async getOrGenerateTradeFeedback(orderId: string): Promise<CoachFeedbackResponse> {
    const cached = await this.prisma.coachFeedback.findUnique({ where: { scope_refId: { scope: "trade", refId: orderId } } });
    if (cached) {
      return {
        scope: "trade",
        refId: orderId,
        feedback: this.parseFeedback(cached.feedbackJson, cached.isMock),
        createdAt: cached.createdAt.toISOString(),
        xpAwarded: 0,
      };
    }

    const order = await this.prisma.paperOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`No existe la orden "${orderId}".`);
    if (order.side !== "sell") {
      throw new BadRequestException("El mentor analiza operaciones cerradas: pide feedback sobre una venta.");
    }

    const plan = await this.prisma.tradePlan.findUnique({ where: { orderId } });
    if (!plan) throw new BadRequestException("Esta orden no tiene plan registrado, no hay nada que analizar.");

    const entry = await this.prisma.journalEntry.findUnique({ where: { orderId } });
    const reflection = entry ? this.tryParse(entry.contentJson)?.reflection : undefined;

    // Holding days: from the first buy of this ticker in the portfolio to the sell.
    const firstBuy = await this.prisma.paperOrder.findFirst({
      where: { portfolioId: order.portfolioId, ticker: order.ticker, side: "buy" },
      orderBy: { executedAt: "asc" },
    });
    const holdingDays = firstBuy
      ? Math.max(0, Math.round((order.executedAt.getTime() - firstBuy.executedAt.getTime()) / 86_400_000))
      : undefined;

    const input: CoachTradeInput = {
      ticker: order.ticker,
      side: "sell",
      plan: {
        reason: plan.reason,
        expectation: plan.expectation,
        riskNoted: plan.riskNoted,
        exitPlan: plan.exitPlan,
        stopPrice: plan.stopPrice ?? undefined,
        portfolioPct: plan.portfolioPct,
      } satisfies TradePlanInput,
      emotion: plan.emotion as EmotionalState,
      entryContext: {
        quantity: order.quantity,
        price: order.price,
        realizedPnlPct: order.realizedPnlPct ?? undefined,
        holdingDays,
        avgCostAtSale: order.realizedPnl != null && order.quantity > 0 ? order.price - order.realizedPnl / order.quantity : undefined,
      },
      reflection,
      availableLessons: this.lessonCatalog(),
    };

    const { feedback, isMock } = await this.runAgentOrMock(input);

    const row = await this.prisma.coachFeedback.create({
      data: { scope: "trade", refId: orderId, feedbackJson: JSON.stringify(feedback), isMock },
    });
    const { awarded } = await this.xp.award("coach_feedback", orderId, `coach:${orderId}`);

    return { scope: "trade", refId: orderId, feedback, createdAt: row.createdAt.toISOString(), xpAwarded: awarded };
  }

  async getCachedTradeFeedback(orderId: string): Promise<CoachFeedbackResponse> {
    const cached = await this.prisma.coachFeedback.findUnique({ where: { scope_refId: { scope: "trade", refId: orderId } } });
    if (!cached) throw new NotFoundException("Todavía no hay feedback del mentor para esta operación.");
    return {
      scope: "trade",
      refId: orderId,
      feedback: this.parseFeedback(cached.feedbackJson, cached.isMock),
      createdAt: cached.createdAt.toISOString(),
      xpAwarded: 0,
    };
  }

  /**
   * Period review over the last 10 trades -- cached per local date, so at
   * most one Gemini call per day regardless of taps.
   */
  async getOrGeneratePeriodReview(): Promise<CoachFeedbackResponse> {
    const today = new Date().toISOString().slice(0, 10);
    const cached = await this.prisma.coachFeedback.findUnique({ where: { scope_refId: { scope: "period", refId: today } } });
    if (cached) {
      return {
        scope: "period",
        refId: today,
        feedback: this.parseFeedback(cached.feedbackJson, cached.isMock),
        createdAt: cached.createdAt.toISOString(),
        xpAwarded: 0,
      };
    }

    const plans = await this.prisma.tradePlan.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
    if (plans.length === 0) {
      throw new BadRequestException("Aún no hay operaciones con plan que revisar. Opera primero en Práctica.");
    }
    const orders = await this.prisma.paperOrder.findMany({ where: { id: { in: plans.map((p) => p.orderId) } } });
    const orderById = new Map(orders.map((o) => [o.id, o]));

    const sells = plans.filter((p) => orderById.get(p.orderId)?.side === "sell");
    const input: CoachPeriodInput = {
      tradeCount: plans.length,
      emotions: plans.map((p) => p.emotion),
      avgPositionPct: plans.reduce((acc, p) => acc + p.portfolioPct, 0) / plans.length,
      tradesWithoutStop: plans.filter((p) => p.stopPrice == null).length,
      realizedResults: sells
        .map((p) => orderById.get(p.orderId)?.realizedPnlPct)
        .filter((v): v is number => v != null)
        .map((v) => `${(v * 100).toFixed(1)}%`),
      availableLessons: this.lessonCatalog(),
    };

    const { feedback, isMock } = await this.runPeriodAgentOrMock(input);
    const row = await this.prisma.coachFeedback.create({
      data: { scope: "period", refId: today, feedbackJson: JSON.stringify(feedback), isMock },
    });

    return { scope: "period", refId: today, feedback, createdAt: row.createdAt.toISOString(), xpAwarded: 0 };
  }

  private async runAgentOrMock(input: CoachTradeInput): Promise<{ feedback: CoachFeedbackDto; isMock: boolean }> {
    if (!this.client.isConfigured) {
      return { feedback: { ...buildMockCoachFeedback(input), isMock: true }, isMock: true };
    }
    try {
      const result = await runCoachAgent(this.client, input);
      return { feedback: { ...result, isMock: false }, isMock: false };
    } catch (err) {
      if (err instanceof NoApiKeyError) {
        return { feedback: { ...buildMockCoachFeedback(input), isMock: true }, isMock: true };
      }
      this.logger.error(`El agente coach falló: ${(err as Error).message}`);
      throw err;
    }
  }

  private async runPeriodAgentOrMock(input: CoachPeriodInput): Promise<{ feedback: CoachFeedbackDto; isMock: boolean }> {
    if (!this.client.isConfigured) {
      return { feedback: { ...buildMockPeriodFeedback(input), isMock: true }, isMock: true };
    }
    try {
      const result = await runCoachPeriodAgent(this.client, input);
      return { feedback: { ...result, isMock: false }, isMock: false };
    } catch (err) {
      if (err instanceof NoApiKeyError) {
        return { feedback: { ...buildMockPeriodFeedback(input), isMock: true }, isMock: true };
      }
      this.logger.error(`La revisión de periodo falló: ${(err as Error).message}`);
      throw err;
    }
  }

  private lessonCatalog(): { id: string; title: string }[] {
    return CURRICULUM.flatMap((level) => level.lessons.map((l) => ({ id: l.id, title: l.title })));
  }

  private parseFeedback(json: string, isMock: boolean): CoachFeedbackDto {
    try {
      return { ...(JSON.parse(json) as CoachFeedbackDto), isMock };
    } catch {
      this.logger.warn("feedbackJson malformado");
      return {
        followedPlan: false,
        planAdherence: "No se pudo leer el feedback guardado.",
        emotionalRead: "",
        strengths: [],
        improvements: [],
        suggestedLessonIds: [],
        question: "",
        isMock,
      };
    }
  }

  private tryParse(json: string): { reflection?: string } | undefined {
    try {
      return JSON.parse(json);
    } catch {
      return undefined;
    }
  }
}
