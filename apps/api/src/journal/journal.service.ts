import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { JournalContent, JournalEntryDto, SaveReflectionRequest, TradePlanDto } from "@stockiq/shared-types";
import { PrismaService } from "../common/prisma/prisma.service";
import { XpService } from "../profile/xp.service";

interface EntryRow {
  id: string;
  kind: string;
  orderId: string | null;
  portfolioId: string | null;
  ticker: string | null;
  contentJson: string;
  reflectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async listEntries(filter: { ticker?: string; kind?: string }): Promise<JournalEntryDto[]> {
    const entries = await this.prisma.journalEntry.findMany({
      where: {
        ...(filter.ticker ? { ticker: filter.ticker.toUpperCase() } : {}),
        ...(filter.kind ? { kind: filter.kind } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return entries.map((e) => this.toDto(e));
  }

  async getEntry(id: string): Promise<JournalEntryDto & { tradePlan?: TradePlanDto }> {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`No existe la entrada "${id}".`);

    let tradePlan: TradePlanDto | undefined;
    if (entry.orderId) {
      const plan = await this.prisma.tradePlan.findUnique({ where: { orderId: entry.orderId } });
      if (plan) {
        tradePlan = {
          id: plan.id,
          orderId: plan.orderId,
          portfolioId: plan.portfolioId,
          ticker: plan.ticker,
          side: plan.side as "buy" | "sell",
          reason: plan.reason,
          expectation: plan.expectation,
          riskNoted: plan.riskNoted,
          exitPlan: plan.exitPlan,
          stopPrice: plan.stopPrice ?? undefined,
          portfolioPct: plan.portfolioPct,
          emotion: plan.emotion as TradePlanDto["emotion"],
          createdAt: plan.createdAt.toISOString(),
        };
      }
    }

    return { ...this.toDto(entry), tradePlan };
  }

  /** Post-trade reflection: sets reflectedAt and grants XP once per entry. */
  async saveReflection(id: string, dto: SaveReflectionRequest): Promise<JournalEntryDto & { xpAwarded: number }> {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`No existe la entrada "${id}".`);

    const content = this.parseContent(entry.contentJson);
    content.reflection = dto.reflection;
    content.mistakes = dto.mistakes;
    content.learnings = dto.learnings;

    const updated = await this.prisma.journalEntry.update({
      where: { id },
      data: { contentJson: JSON.stringify(content), reflectedAt: entry.reflectedAt ?? new Date() },
    });

    const { awarded } = await this.xp.award("reflection", id, `reflection:${id}`);
    return { ...this.toDto(updated), xpAwarded: awarded };
  }

  async createNote(text: string): Promise<JournalEntryDto> {
    const content: JournalContent = { text };
    const entry = await this.prisma.journalEntry.create({
      data: { kind: "note", contentJson: JSON.stringify(content) },
    });
    return this.toDto(entry);
  }

  private toDto(entry: EntryRow): JournalEntryDto {
    return {
      id: entry.id,
      kind: entry.kind as JournalEntryDto["kind"],
      orderId: entry.orderId ?? undefined,
      portfolioId: entry.portfolioId ?? undefined,
      ticker: entry.ticker ?? undefined,
      content: this.parseContent(entry.contentJson),
      reflectedAt: entry.reflectedAt?.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  /** Malformed JSON must never turn into a 500 on the journal list. */
  private parseContent(json: string): JournalContent {
    try {
      return JSON.parse(json) as JournalContent;
    } catch {
      this.logger.warn(`contentJson malformado, devolviendo contenido vacío`);
      return {};
    }
  }
}
