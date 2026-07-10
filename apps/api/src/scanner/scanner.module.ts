import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { ScoringModule } from "../scoring/scoring.module";
import { ScannerService } from "./scanner.service";
import { ScannerController } from "./scanner.controller";

@Module({
  imports: [MarketDataModule, ScoringModule],
  controllers: [ScannerController],
  providers: [ScannerService],
})
export class ScannerModule {}
