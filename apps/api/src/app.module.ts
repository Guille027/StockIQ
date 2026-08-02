import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { CacheModule } from "./common/cache/cache.module";
import { FinnhubThrottleModule } from "./common/finnhub/finnhub-throttle.module";
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
import { ProfileModule } from "./profile/profile.module";
import { LearningModule } from "./learning/learning.module";
import { JournalModule } from "./journal/journal.module";
import { CoachModule } from "./coach/coach.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    // apps/api has no .env of its own -- the monorepo root's .env (see
    // README.md) is the single source of truth. __dirname is apps/api/src in
    // dev and apps/api/dist in the built app, both three levels below root.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: join(__dirname, "../../../.env") }),
    PrismaModule,
    CacheModule,
    FinnhubThrottleModule,
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
    ProfileModule,
    LearningModule,
    JournalModule,
    CoachModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
