import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MarketDataService } from "./market-data.service";
import { MARKET_DATA_PROVIDER } from "./providers/market-data-provider.interface";
import { MockMarketDataProvider } from "./providers/mock-provider";
import { FinnhubMarketDataProvider } from "./providers/finnhub-provider";

@Module({
  providers: [
    MarketDataService,
    MockMarketDataProvider,
    FinnhubMarketDataProvider,
    {
      provide: MARKET_DATA_PROVIDER,
      useFactory: (config: ConfigService, finnhub: FinnhubMarketDataProvider, mock: MockMarketDataProvider) => {
        return config.get<string>("FINNHUB_API_KEY") ? finnhub : mock;
      },
      inject: [ConfigService, FinnhubMarketDataProvider, MockMarketDataProvider],
    },
  ],
  exports: [MarketDataService],
})
export class MarketDataModule {}
