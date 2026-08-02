import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { ProfileModule } from "../profile/profile.module";
import { LearningService } from "./learning.service";
import { LearningController } from "./learning.controller";

/**
 * Serves the static curriculum (@stockiq/curriculum) over HTTP: the roadmap
 * with unlock/progress state, individual lessons (with liveStat blocks
 * enriched from cached market data), and server-side quiz grading + XP.
 * The mobile app never bundles lesson content -- answer keys live here.
 */
@Module({
  imports: [MarketDataModule, ProfileModule],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}
