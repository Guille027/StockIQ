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

  async wrap<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await fn();
    this.set(key, value, ttlSeconds);
    return value;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }
}
