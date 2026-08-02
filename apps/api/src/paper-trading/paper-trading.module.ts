import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { ProfileModule } from "../profile/profile.module";
import { PaperTradingController } from "./paper-trading.controller";
import { PaperTradingService } from "./paper-trading.service";

@Module({
  imports: [MarketDataModule, ProfileModule],
  controllers: [PaperTradingController],
  providers: [PaperTradingService],
})
export class PaperTradingModule {}
