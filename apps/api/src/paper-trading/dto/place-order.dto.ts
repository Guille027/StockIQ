import { IsIn, IsNumber, IsString, Min } from "class-validator";

export class PlaceOrderDto {
  @IsString()
  ticker!: string;

  @IsIn(["buy", "sell"])
  side!: "buy" | "sell";

  @IsNumber()
  @Min(0.0001)
  quantity!: number;
}
