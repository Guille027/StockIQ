import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import type { ScannerFilter } from "@stockiq/shared-types";

export class ScannerFilterDto implements ScannerFilter {
  @IsOptional() @IsNumber() peMax?: number;
  @IsOptional() @IsNumber() roeMin?: number;
  @IsOptional() @IsNumber() roicMin?: number;
  @IsOptional() @IsNumber() revenueGrowthMin?: number;
  @IsOptional() @IsNumber() epsGrowthMin?: number;
  @IsOptional() @IsNumber() operatingMarginMin?: number;
  @IsOptional() @IsNumber() marketCapMin?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) sectors?: string[];
  @IsOptional() @IsNumber() upcomingEarningsWithinDays?: number;
  @IsOptional() @IsBoolean() insiderBuyingOnly?: boolean;
  @IsOptional() @IsBoolean() positiveNewsOnly?: boolean;
  @IsOptional() @IsNumber() minGlobalScore?: number;
}
