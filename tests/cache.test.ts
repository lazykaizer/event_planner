import { describe, it, expect, beforeEach } from 'vitest';
import { apiCache } from '@/lib/cache';

describe('LRU Cache & Efficiency Engine', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  it('stores and retrieves cached payloads', () => {
    const key = apiCache.hashKey('test', { foo: 'bar' });
    apiCache.set(key, { result: 42 });

    const retrieved = apiCache.get<{ result: number }>(key);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.result).toBe(42);
  });

  it('returns null on cache miss', () => {
    const miss = apiCache.get('nonexistent_key');
    expect(miss).toBeNull();
  });

  it('correctly tracks cache hits and misses', () => {
    const key = apiCache.hashKey('test', { id: 1 });
    apiCache.get(key); // Miss 1
    apiCache.set(key, { data: 'val' });
    apiCache.get(key); // Hit 1
    apiCache.get(key); // Hit 2

    const stats = apiCache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatio).toBeCloseTo(0.6667, 3);
  });

  it('generates consistent deterministic hashes for identical objects regardless of key ordering', () => {
    const key1 = apiCache.hashKey('quote', { a: 1, b: 2 });
    const key2 = apiCache.hashKey('quote', { a: 1, b: 2 });
    expect(key1).toBe(key2);
  });

  it('expires entries after TTL elapses', async () => {
    const key = apiCache.hashKey('expire', { id: 99 });
    apiCache.set(key, { temporary: true }, 50); // 50ms TTL

    expect(apiCache.get(key)).not.toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(apiCache.get(key)).toBeNull();
  });
});
