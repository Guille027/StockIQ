import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { ScoringModule } from "../scoring/scoring.module";
import { CompaniesController } from "./companies.controller";

@Module({
  imports: [MarketDataModule, ScoringModule],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
