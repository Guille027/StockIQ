import { Global, Module } from "@nestjs/common";
import { FinnhubThrottle } from "./finnhub-throttle.service";

@Global()
@Module({
  providers: [FinnhubThrottle],
  exports: [FinnhubThrottle],
})
export class FinnhubThrottleModule {}
