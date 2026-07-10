import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { NewsModule } from "../news/news.module";
import { ScoringService } from "./scoring.service";

@Module({
  imports: [MarketDataModule, NewsModule],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
