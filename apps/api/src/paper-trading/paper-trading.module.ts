import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { PaperTradingController } from "./paper-trading.controller";
import { PaperTradingService } from "./paper-trading.service";

@Module({
  imports: [MarketDataModule],
  controllers: [PaperTradingController],
  providers: [PaperTradingService],
})
export class PaperTradingModule {}
