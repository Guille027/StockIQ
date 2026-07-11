import { IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreatePortfolioDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @IsNumber()
  @Min(100)
  @Max(100_000_000)
  startingBalance!: number;
}
