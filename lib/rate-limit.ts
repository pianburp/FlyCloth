/**
 * Rate Limit Library
 * 
 * Simple in-memory rate limiter using token bucket algorithm.
 * For production scale, consider using Redis (Upstash) for distributed rate limiting.
 */

interface RateLimitConfig {
  interval: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Creates a rate limiter instance
 */
export function rateLimit(config: RateLimitConfig) {
  const buckets = new Map<string, TokenBucket>();

  // Cleanup old entries periodically (every 5 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      // Remove entries older than 10 minutes
      if (now - bucket.lastRefill > 10 * 60 * 1000) {
        buckets.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return {
    /**
     * Check if request is allowed for the given identifier (e.g., IP address)
     */
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      let bucket = buckets.get(identifier);

      if (!bucket) {
        // New bucket with full tokens
        bucket = {
          tokens: config.maxRequests - 1, // Use one token immediately
          lastRefill: now,
        };
        buckets.set(identifier, bucket);
        return {
          success: true,
          remaining: bucket.tokens,
          reset: now + config.interval,
        };
      }

      // Calculate tokens to add based on time elapsed
      const elapsed = now - bucket.lastRefill;
      const tokensToAdd = Math.floor(elapsed / config.interval) * config.maxRequests;

      if (tokensToAdd > 0) {
        bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
      }

      // Check if we have tokens available
      if (bucket.tokens > 0) {
        bucket.tokens--;
        return {
          success: true,
          remaining: bucket.tokens,
          reset: bucket.lastRefill + config.interval,
        };
      }

      // Rate limited
      return {
        success: false,
        remaining: 0,
        reset: bucket.lastRefill + config.interval,
      };
    },

    /**
     * Reset the bucket for a specific identifier (useful for testing)
     */
    reset(identifier: string): void {
      buckets.delete(identifier);
    },

    /**
     * Clear all buckets
     */
    clear(): void {
      buckets.clear();
    },
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const checkoutRateLimiter = rateLimit({
  interval: 60 * 1000,  // 1 minute
  maxRequests: 5,       // 5 requests per minute
});

export const webhookRateLimiter = rateLimit({
  interval: 60 * 1000,  // 1 minute
  maxRequests: 100,     // 100 requests per minute (Stripe retries)
});

export const adminRateLimiter = rateLimit({
  interval: 60 * 1000,  // 1 minute
  maxRequests: 30,      // 30 requests per minute
});
