import { Body, Controller, NotImplementedException, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

/**
 * TODO (phase 2): runs a `StrategyDefinition` (see
 * packages/shared-types/src/backtesting.ts) against historical fundamentals
 * snapshots + price bars, rebalancing on the configured cadence, and
 * benchmarking against the S&P 500. Persist runs in `BacktestRun` (Prisma).
 * Must compute CAGR/Sharpe/Sortino/max drawdown/win rate/profit factor and
 * surface robustness warnings (too few trades, too narrow a date range,
 * over-concentration in a handful of names) to guard against overfitting.
 * Contract: POST /backtesting/run -> BacktestResult.
 */
@ApiTags("backtesting")
@Controller("backtesting")
export class BacktestingController {
  @Post("run")
  notImplemented(@Body() _body: unknown): never {
    throw new NotImplementedException("Backtesting todavía no implementado -- ver roadmap en docs/ARCHITECTURE.md.");
  }
}
