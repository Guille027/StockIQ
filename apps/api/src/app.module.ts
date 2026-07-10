import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { CacheModule } from "./common/cache/cache.module";
import { AuthModule } from "./auth/auth.module";
import { MarketDataModule } from "./market-data/market-data.module";
import { ScoringModule } from "./scoring/scoring.module";
import { NewsModule } from "./news/news.module";
import { AiModule } from "./ai/ai.module";
import { ScannerModule } from "./scanner/scanner.module";
import { CompaniesModule } from "./companies/companies.module";
import { HomeModule } from "./home/home.module";
import { CalendarModule } from "./calendar/calendar.module";
import { BacktestingModule } from "./backtesting/backtesting.module";
import { PaperTradingModule } from "./paper-trading/paper-trading.module";
import { AlertsModule } from "./alerts/alerts.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CacheModule,
    AuthModule,
    MarketDataModule,
    NewsModule,
    ScoringModule,
    AiModule,
    ScannerModule,
    CompaniesModule,
    HomeModule,
    CalendarModule,
    BacktestingModule,
    PaperTradingModule,
    AlertsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
