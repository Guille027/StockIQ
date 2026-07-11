// No userId -- StockIQ is single-user, a portfolio just belongs to "you".
export interface PaperPortfolio {
  id: string;
  name: string;
  cashBalance: number;
  startingBalance: number;
  createdAt: string;
}

export interface PaperPosition {
  portfolioId: string;
  ticker: string;
  quantity: number;
  avgCostBasis: number;
}

export interface PaperOrder {
  id: string;
  portfolioId: string;
  ticker: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  executedAt: string;
}

export interface PortfolioStats extends PaperPortfolio {
  totalValue: number;
  totalReturnPct: number;
  /** Not tracked yet (needs historical portfolio-value snapshots) -- always 0 for now. */
  dayChangePct: number;
  positions: (PaperPosition & { currentPrice: number; marketValue: number; unrealizedPnlPct: number })[];
}
