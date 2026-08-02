import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MarketDataModule } from "../market-data/market-data.module";
import { NewsModule } from "../news/news.module";
import { ScoringModule } from "../scoring/scoring.module";
import { AI_CLIENT } from "./ai-client.interface";
import { GeminiClient } from "./gemini.client";
import { AnthropicClient } from "./anthropic.client";
import { OrchestratorService } from "./orchestrator.service";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";

@Module({
  imports: [MarketDataModule, ScoringModule, NewsModule],
  controllers: [AiController],
  providers: [
    GeminiClient,
    AnthropicClient,
    {
      // Gemini is the default (genuinely free tier, no card). Anthropic
      // stays available as an opt-in paid alternative behind the same
      // AiClient interface -- set ANTHROPIC_API_KEY (and no GEMINI_API_KEY)
      // to use it instead.
      provide: AI_CLIENT,
      useFactory: (config: ConfigService, gemini: GeminiClient, anthropic: AnthropicClient) => {
        if (config.get<string>("GEMINI_API_KEY")) return gemini;
        if (config.get<string>("ANTHROPIC_API_KEY")) return anthropic;
        return gemini; // reports itself as unconfigured -> orchestrator falls back to mock
      },
      inject: [ConfigService, GeminiClient, AnthropicClient],
    },
    OrchestratorService,
    AiService,
  ],
  // AI_CLIENT is exported so other modules (coach) can run their own agents
  // through the same provider abstraction (and its mock fallback story).
  exports: [AiService, AI_CLIENT],
})
export class AiModule {}
