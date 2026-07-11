import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

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
}
