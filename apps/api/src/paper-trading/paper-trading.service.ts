import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  EmotionalState,
  JournalContent,
  PaperOrder,
  PaperPosition,
  PlaceOrderResponse,
  PortfolioStats,
  TradePlanInput,
} from "@stockiq/shared-types";
import { isInUniverse } from "@stockiq/universe";
import { PrismaService } from "../common/prisma/prisma.service";
import { MarketDataService } from "../market-data/market-data.service";
import { XpService } from "../profile/xp.service";

interface PortfolioRow {
  id: string;
  name: string;
  cashBalance: number;
  startingBalance: number;
  createdAt: Date;
}

interface OrderRow {
  id: string;
  portfolioId: string;
  ticker: string;
  side: string;
  quantity: number;
  price: number;
  executedAt: Date;
  realizedPnl: number | null;
  realizedPnlPct: number | null;
}

/**
 * All simulated -- no real money, no brokerage, ever. Orders execute at the
 * current market price from MarketDataService (mock or real, whatever the
 * rest of the app is using). Positions are derived from the order history
 * (average-cost method) rather than stored redundantly, so there's only one
 * source of truth to keep consistent.
 */
@Injectable()
export class PaperTradingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketData: MarketDataService,
    private readonly xp: XpService,
  ) {}

  async listPortfolios(): Promise<PortfolioStats[]> {
    const portfolios = await this.prisma.paperPortfolio.findMany({ orderBy: { createdAt: "asc" } });
    return Promise.all(portfolios.map((p) => this.buildStats(p)));
  }

  async createPortfolio(name: string, startingBalance: number): Promise<PortfolioStats> {
    const portfolio = await this.prisma.paperPortfolio.create({
      data: { name, cashBalance: startingBalance, startingBalance },
    });
    return this.buildStats(portfolio);
  }

  async getPortfolio(id: string): Promise<PortfolioStats> {
    const portfolio = await this.findOrThrow(id);
    return this.buildStats(portfolio);
  }

  async listOrders(id: string): Promise<PaperOrder[]> {
    await this.findOrThrow(id);
    const orders = await this.prisma.paperOrder.findMany({ where: { portfolioId: id }, orderBy: { executedAt: "desc" } });
    return orders.map((o) => this.toPaperOrder(o));
  }

  /**
   * Every order requires a pre-trade plan + emotional state: the plan, the
   * order, and its journal entry are created atomically. Sells also record
   * realized P&L vs. the average cost at the moment of selling -- that's what
   * the coach and the phase-2 stats work from.
   */
  async placeOrder(
    id: string,
    tickerParam: string,
    side: "buy" | "sell",
    amounts: { quantity?: number; amount?: number },
    plan: TradePlanInput,
    emotion: EmotionalState,
  ): Promise<PlaceOrderResponse> {
    const ticker = tickerParam.toUpperCase();
    if (!isInUniverse(ticker)) {
      throw new BadRequestException(`${ticker} no pertenece al universo de inversión de StockIQ.`);
    }
    if ((amounts.quantity === undefined) === (amounts.amount === undefined)) {
      throw new BadRequestException("Especifica o bien una cantidad de acciones, o bien un importe en dólares (no ambos).");
    }

    const portfolio = await this.findOrThrow(id);
    const { price } = await this.marketData.getFundamentals(ticker);
    // Resolve a dollar amount to a (possibly fractional) share quantity at
    // the current price -- rounded to 6 decimals, same precision most
    // fractional-share brokers use, to avoid floating-point noise.
    const quantity = amounts.quantity ?? Math.round((amounts.amount! / price) * 1e6) / 1e6;

    let realizedPnl: number | undefined;
    let realizedPnlPct: number | undefined;
    let cashDelta: number;

    if (side === "buy") {
      const cost = price * quantity;
      if (cost > portfolio.cashBalance) {
        throw new BadRequestException(
          `Fondos insuficientes: la orden cuesta $${cost.toFixed(2)} y solo tienes $${portfolio.cashBalance.toFixed(2)} en efectivo.`,
        );
      }
      cashDelta = -cost;
    } else {
      const positions = await this.computePositions(id);
      const position = positions.find((p) => p.ticker === ticker);
      const held = position?.quantity ?? 0;
      if (quantity > held) {
        throw new BadRequestException(`Solo tienes ${held} acciones de ${ticker}; no puedes vender ${quantity}.`);
      }
      cashDelta = price * quantity;
      const avgCost = position!.avgCostBasis;
      realizedPnl = (price - avgCost) * quantity;
      realizedPnlPct = avgCost > 0 ? (price - avgCost) / avgCost : 0;
    }

    // Server-side truth for the position size the user claimed in the plan.
    const stats = await this.buildStats(portfolio);
    const orderValue = price * quantity;
    const portfolioPct = stats.totalValue > 0 ? Math.min(100, (orderValue / stats.totalValue) * 100) : 0;

    const content: JournalContent = {
      plan: { ...plan, portfolioPct },
      emotion,
      side,
      quantity,
      price,
      resultPct: realizedPnlPct,
    };

    const [, order] = await this.prisma.$transaction([
      this.prisma.paperPortfolio.update({
        where: { id },
        data: { cashBalance: cashDelta < 0 ? { decrement: -cashDelta } : { increment: cashDelta } },
      }),
      this.prisma.paperOrder.create({ data: { portfolioId: id, ticker, side, quantity, price, realizedPnl, realizedPnlPct } }),
    ]);
    // TradePlan/JournalEntry need the order id, so they land in a second
    // atomic write right after (a failure here would leave the order without
    // its plan -- acceptable for a single-user training app, and the coach
    // simply skips orders without plans).
    await this.prisma.$transaction([
      this.prisma.tradePlan.create({
        data: {
          orderId: order.id,
          portfolioId: id,
          ticker,
          side,
          reason: plan.reason,
          expectation: plan.expectation,
          riskNoted: plan.riskNoted,
          exitPlan: plan.exitPlan,
          stopPrice: plan.stopPrice,
          portfolioPct,
          emotion,
        },
      }),
      this.prisma.journalEntry.create({
        data: {
          kind: "trade",
          orderId: order.id,
          portfolioId: id,
          ticker,
          contentJson: JSON.stringify(content),
        },
      }),
    ]);

    const { awarded } = await this.xp.award("trade_plan", order.id, `plan:${order.id}`);

    return { portfolio: await this.getPortfolio(id), orderId: order.id, xpAwarded: awarded };
  }

  async resetPortfolio(id: string): Promise<PortfolioStats> {
    const portfolio = await this.findOrThrow(id);
    await this.prisma.$transaction([
      this.prisma.tradePlan.deleteMany({ where: { portfolioId: id } }),
      this.prisma.journalEntry.deleteMany({ where: { portfolioId: id } }),
      this.prisma.paperOrder.deleteMany({ where: { portfolioId: id } }),
      this.prisma.paperPortfolio.update({ where: { id }, data: { cashBalance: portfolio.startingBalance } }),
    ]);
    return this.getPortfolio(id);
  }

  async deletePortfolio(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.$transaction([
      this.prisma.tradePlan.deleteMany({ where: { portfolioId: id } }),
      this.prisma.journalEntry.deleteMany({ where: { portfolioId: id } }),
      this.prisma.paperOrder.deleteMany({ where: { portfolioId: id } }),
      this.prisma.paperPortfolio.delete({ where: { id } }),
    ]);
  }

  private async findOrThrow(id: string): Promise<PortfolioRow> {
    const portfolio = await this.prisma.paperPortfolio.findUnique({ where: { id } });
    if (!portfolio) throw new NotFoundException(`No existe la cartera "${id}".`);
    return portfolio;
  }

  private async computePositions(portfolioId: string): Promise<PaperPosition[]> {
    const orders = await this.prisma.paperOrder.findMany({ where: { portfolioId }, orderBy: { executedAt: "asc" } });
    const byTicker = new Map<string, { quantity: number; totalCost: number }>();

    for (const order of orders) {
      const entry = byTicker.get(order.ticker) ?? { quantity: 0, totalCost: 0 };
      if (order.side === "buy") {
        entry.totalCost += order.price * order.quantity;
        entry.quantity += order.quantity;
      } else {
        const avgCost = entry.quantity > 0 ? entry.totalCost / entry.quantity : 0;
        entry.totalCost -= avgCost * order.quantity;
        entry.quantity -= order.quantity;
      }
      byTicker.set(order.ticker, entry);
    }

    return [...byTicker.entries()]
      .filter(([, v]) => v.quantity > 1e-6)
      .map(([ticker, v]) => ({ portfolioId, ticker, quantity: v.quantity, avgCostBasis: v.totalCost / v.quantity }));
  }

  private async buildStats(portfolio: PortfolioRow): Promise<PortfolioStats> {
    const positions = await this.computePositions(portfolio.id);
    const enrichedPositions = await Promise.all(
      positions.map(async (p) => {
        const { price: currentPrice } = await this.marketData.getFundamentals(p.ticker);
        const marketValue = currentPrice * p.quantity;
        const unrealizedPnlPct = p.avgCostBasis > 0 ? (currentPrice - p.avgCostBasis) / p.avgCostBasis : 0;
        return { ...p, currentPrice, marketValue, unrealizedPnlPct };
      }),
    );

    const totalValue = portfolio.cashBalance + enrichedPositions.reduce((acc, p) => acc + p.marketValue, 0);
    const totalReturnPct = portfolio.startingBalance > 0 ? (totalValue - portfolio.startingBalance) / portfolio.startingBalance : 0;

    return {
      id: portfolio.id,
      name: portfolio.name,
      cashBalance: portfolio.cashBalance,
      startingBalance: portfolio.startingBalance,
      createdAt: portfolio.createdAt.toISOString(),
      totalValue,
      totalReturnPct,
      dayChangePct: 0, // not tracked yet -- needs historical portfolio-value snapshots
      positions: enrichedPositions,
    };
  }

  private toPaperOrder(order: OrderRow): PaperOrder {
    return {
      id: order.id,
      portfolioId: order.portfolioId,
      ticker: order.ticker,
      side: order.side as "buy" | "sell",
      quantity: order.quantity,
      price: order.price,
      executedAt: order.executedAt.toISOString(),
      realizedPnl: order.realizedPnl ?? undefined,
      realizedPnlPct: order.realizedPnlPct ?? undefined,
    };
  }
}
