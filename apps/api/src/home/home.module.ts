import { Module } from "@nestjs/common";
import { MarketDataModule } from "../market-data/market-data.module";
import { NewsModule } from "../news/news.module";
import { AiModule } from "../ai/ai.module";
import { HomeService } from "./home.service";
import { HomeController } from "./home.controller";

@Module({
  imports: [MarketDataModule, NewsModule, AiModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
