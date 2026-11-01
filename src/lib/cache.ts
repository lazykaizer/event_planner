/**
 * High-performance In-Memory LRU Cache with SHA-256 Content Hashing.
 *
 * Maximizes API efficiency and sub-millisecond response latency by caching
 * identical quote extraction and budget planning requests, eliminating
 * redundant LLM round-trips and computational overhead.
 */

import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  lastAccessed: number;
}

class MemoryLRUCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;
  private defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxEntries = 500, defaultTtlMs = 15 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generates a deterministic SHA-256 hash for arbitrary payloads.
   */
  public hashKey(prefix: string, payload: unknown): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = crypto.createHash('sha256').update(serialized).digest('hex').slice(0, 32);
    return `${prefix}:${hash}`;
  }

  /**
   * Retrieves an item from the cache if present and not expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    entry.lastAccessed = Date.now();
    return entry.data as T;
  }

  /**
   * Stores an item with an optional TTL in milliseconds.
   */
  public set<T>(key: string, data: T, ttlMs?: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest accessed entry
      let oldestKey: string | null = null;
      let oldestAccess = Infinity;
      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessed < oldestAccess) {
          oldestAccess = v.lastAccessed;
          oldestKey = k;
        }
      }
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const ttl = ttlMs ?? this.defaultTtlMs;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Returns cache metrics for observability and auditing.
   */
  public getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRatio: total > 0 ? Number((this.hits / total).toFixed(4)) : 0,
    };
  }

  /**
   * Clears all cache entries (useful for testing).
   */
  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const apiCache = new MemoryLRUCache(500, 15 * 60 * 1000); // 15 mins TTL

/**
 * Deterministic hash key generator helper.
 */
export function hashPayload(prefix: string, payload: unknown): string {
  return apiCache.hashKey(prefix, payload);
}
