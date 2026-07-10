import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { NewsModule } from "../news/news.module";
import { ScoringModule } from "../scoring/scoring.module";
import { AnthropicClient } from "./anthropic.client";
import { OrchestratorService } from "./orchestrator.service";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";

@Module({
  imports: [MarketDataModule, ScoringModule, NewsModule],
  controllers: [AiController],
  providers: [AnthropicClient, OrchestratorService, AiService],
  exports: [AiService],
})
export class AiModule {}
