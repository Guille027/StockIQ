import { Controller, Get, NotImplementedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * TODO (phase 2): CRUD over `PaperPortfolio`/`PaperOrder` (Prisma models
 * already defined) with buy/sell endpoints that price fills using
 * MarketDataService, plus a stats endpoint computing PortfolioStats (see
 * packages/shared-types/src/portfolio.ts). No real money ever involved.
 * Contract: GET/POST /paper-trading/portfolios, POST /paper-trading/orders.
 */
@ApiTags("paper-trading")
@Controller("paper-trading")
export class PaperTradingController {
  @Get("portfolios")
  notImplemented(): never {
    throw new NotImplementedException("Paper trading todavía no implementado -- ver roadmap en docs/ARCHITECTURE.md.");
  }
}
