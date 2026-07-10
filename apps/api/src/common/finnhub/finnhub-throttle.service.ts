import { Injectable } from "@nestjs/common";

// Finnhub's free tier shares one 60 req/min bucket across every endpoint for
// a given API key, so every module that calls Finnhub directly (market-data,
// news) must funnel through this single shared queue -- otherwise each
// module throttling itself independently would still add up to more than
// 60 req/min combined.
const MIN_CALL_INTERVAL_MS = 1100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class FinnhubThrottle {
  private queue: Promise<unknown> = Promise.resolve();
  private lastCallAt = 0;

  schedule<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const wait = Math.max(0, this.lastCallAt + MIN_CALL_INTERVAL_MS - Date.now());
      if (wait > 0) await sleep(wait);
      this.lastCallAt = Date.now();
      return fn();
    });
    // Keep the queue alive even if this particular call rejects.
    this.queue = run.catch(() => undefined);
    return run;
  }
}
