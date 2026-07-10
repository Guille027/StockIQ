export interface PaperPortfolio {
  id: string;
  userId: string;
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

export interface PortfolioStats {
  portfolioId: string;
  totalValue: number;
  totalReturnPct: number;
  dayChangePct: number;
  positions: (PaperPosition & { currentPrice: number; marketValue: number; unrealizedPnlPct: number })[];
}
