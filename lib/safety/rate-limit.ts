export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

type RateLimitRecord = {
  timestamps: number[];
};

// Global in-memory storage for sliding window rate limits
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks if an incoming action is allowed within the rate limits using a sliding window algorithm.
 *
 * @param key Unique identifier for the rate limit subject (e.g. `login:127.0.0.1` or `write:userId`)
 * @param maxRequests Maximum number of allowed requests within the time window
 * @param windowMs Time window duration in milliseconds (default: 60,000ms = 1 minute)
 * @param now Current timestamp in milliseconds (defaults to Date.now(), injectable for testing)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60_000,
  now: number = Date.now()
): RateLimitResult {
  const record = rateLimitMap.get(key) ?? { timestamps: [] };
  const windowStart = now - windowMs;

  // Filter out expired timestamps older than the sliding window start
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0];
    const resetMs = Math.max(0, oldest + windowMs - now);
    return {
      allowed: false,
      remaining: 0,
      resetMs
    };
  }

  // Record this request timestamp
  activeTimestamps.push(now);
  rateLimitMap.set(key, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: maxRequests - activeTimestamps.length,
    resetMs: windowMs
  };
}

/**
 * Resets the rate limit for a specific key (e.g. after a successful login).
 */
export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

/**
 * Clears all rate limit records (primarily for test isolation).
 */
export function clearAllRateLimits(): void {
  rateLimitMap.clear();
}
