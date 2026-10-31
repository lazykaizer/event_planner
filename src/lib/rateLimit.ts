/**
 * Simple in-memory rate limiter for API routes.
 *
 * Tracks request counts per IP address within a sliding time window.
 * Not suitable for multi-instance deployments (use Redis-based limiter
 * in production), but sufficient for hackathon / single-instance use.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/** Clean up expired entries periodically. */
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Max requests allowed within the window. Default: 10. */
  maxRequests?: number;
  /** Window size in milliseconds. Default: 60_000 (1 minute). */
  windowMs?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether a request from the given IP is allowed.
 *
 * @param ip - Client IP address (or fallback identifier).
 * @param config - Rate limit configuration.
 * @returns Whether the request is allowed, remaining quota, and reset time.
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { maxRequests = 10, windowMs = 60_000 } = config;
  const now = Date.now();

  cleanup();

  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}
