import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { ProfileModule } from "../profile/profile.module";
import { CoachService } from "./coach.service";
import { CoachController } from "./coach.controller";

/**
 * The AI mentor: critiques closed trades against the user's OWN pre-trade
 * plan -- process over results, teaching over judging, never buy/sell
 * advice. Reuses AiModule's AI_CLIENT (Gemini default, Anthropic opt-in,
 * mock fallback when unconfigured). Every result is cached permanently, so
 * AI spend is at most one call per closed trade plus one review per day.
 */
@Module({
  imports: [AiModule, ProfileModule],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
