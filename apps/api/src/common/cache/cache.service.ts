import { Injectable, Logger } from "@nestjs/common";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Process-memory TTL cache used for phase 1. Same interface (get/set/wrap)
 * a Redis-backed implementation would expose, so swapping in real Redis
 * later (see docs/ARCHITECTURE.md roadmap) is a one-file change, not a
 * rewrite of every service that depends on caching.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  /** Single-flight: concurrent calls for the same key while it's still
   * computing share the same in-progress promise instead of each kicking
   * off their own (expensive/rate-limited) computation. */
  async wrap<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = this.run(key, ttlSeconds, fn);
    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Non-blocking read: returns the cached value if present, otherwise
   * kicks off `fn` in the background (deduped with any other in-flight
   * call for the same key) and returns `undefined` immediately instead of
   * waiting. Use this for screens that must stay responsive even while an
   * expensive computation (e.g. scoring the whole universe) is warming up.
   */
  getOrTrigger<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): T | undefined {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    if (!this.inFlight.has(key)) {
      const promise = this.run(key, ttlSeconds, fn);
      this.inFlight.set(key, promise);
      promise.catch((err) => this.logger.warn(`Cálculo en segundo plano para "${key}" falló: ${(err as Error).message}`));
    }
    return undefined;
  }

  private async run<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    try {
      const value = await fn();
      this.set(key, value, ttlSeconds);
      return value;
    } finally {
      this.inFlight.delete(key);
    }
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }
}
