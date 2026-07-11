import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { PaperOrder, PaperPosition, PortfolioStats } from "@stockiq/shared-types";
import { isInUniverse } from "@stockiq/universe";
import { PrismaService } from "../common/prisma/prisma.service";
import { MarketDataService } from "../market-data/market-data.service";

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

  async placeOrder(id: string, tickerParam: string, side: "buy" | "sell", quantity: number): Promise<PortfolioStats> {
    const ticker = tickerParam.toUpperCase();
    if (!isInUniverse(ticker)) {
      throw new BadRequestException(`${ticker} no pertenece al universo de inversión de StockIQ.`);
    }

    const portfolio = await this.findOrThrow(id);
    const { price } = await this.marketData.getFundamentals(ticker);

    if (side === "buy") {
      const cost = price * quantity;
      if (cost > portfolio.cashBalance) {
        throw new BadRequestException(
          `Fondos insuficientes: la orden cuesta $${cost.toFixed(2)} y solo tienes $${portfolio.cashBalance.toFixed(2)} en efectivo.`,
        );
      }
      await this.prisma.$transaction([
        this.prisma.paperPortfolio.update({ where: { id }, data: { cashBalance: { decrement: cost } } }),
        this.prisma.paperOrder.create({ data: { portfolioId: id, ticker, side, quantity, price } }),
      ]);
    } else {
      const positions = await this.computePositions(id);
      const held = positions.find((p) => p.ticker === ticker)?.quantity ?? 0;
      if (quantity > held) {
        throw new BadRequestException(`Solo tienes ${held} acciones de ${ticker}; no puedes vender ${quantity}.`);
      }
      const proceeds = price * quantity;
      await this.prisma.$transaction([
        this.prisma.paperPortfolio.update({ where: { id }, data: { cashBalance: { increment: proceeds } } }),
        this.prisma.paperOrder.create({ data: { portfolioId: id, ticker, side, quantity, price } }),
      ]);
    }

    return this.getPortfolio(id);
  }

  async resetPortfolio(id: string): Promise<PortfolioStats> {
    const portfolio = await this.findOrThrow(id);
    await this.prisma.$transaction([
      this.prisma.paperOrder.deleteMany({ where: { portfolioId: id } }),
      this.prisma.paperPortfolio.update({ where: { id }, data: { cashBalance: portfolio.startingBalance } }),
    ]);
    return this.getPortfolio(id);
  }

  async deletePortfolio(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.paperOrder.deleteMany({ where: { portfolioId: id } });
    await this.prisma.paperPortfolio.delete({ where: { id } });
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
    };
  }
}
