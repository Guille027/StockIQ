import { Type } from "class-transformer";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { EMOTIONAL_STATES, type EmotionalState } from "@stockiq/shared-types";

/**
 * The mandatory pre-trade plan. StockIQ never executes an order without one:
 * answering these questions BEFORE trading is the core training mechanic --
 * it's what turns a simulator into a coach.
 */
export class TradePlanDto {
  /** ¿Por qué compras/vendes? */
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;

  /** ¿Qué esperas que ocurra? */
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  expectation!: string;

  /** ¿Qué riesgo ves? */
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  riskNoted!: string;

  /** ¿Dónde sales si te equivocas? */
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  exitPlan!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stopPrice?: number;

  /** % of the portfolio this order represents (recomputed server-side too). */
  @IsNumber()
  @Min(0)
  @Max(100)
  portfolioPct!: number;
}

/** Exactly one of `quantity` or `amount` must be provided -- checked in
 * PaperTradingService (not expressible cleanly with class-validator alone)
 * since which one is required depends on the other. */
export class PlaceOrderDto {
  @IsString()
  ticker!: string;

  @IsIn(["buy", "sell"])
  side!: "buy" | "sell";

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  quantity?: number;

  /** Dollar amount to buy/sell -- resolved to a (possibly fractional) share
   * quantity at the current market price. */
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ValidateNested()
  @Type(() => TradePlanDto)
  plan!: TradePlanDto;

  /** One-tap emotional state at order time. */
  @IsIn(EMOTIONAL_STATES)
  emotion!: EmotionalState;
}
