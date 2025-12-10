import { Redis } from "@upstash/redis";

/**
 * Redis client for caching
 * Uses Upstash Redis (serverless)
 * 
 * Required env vars:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

// Only initialize if env vars are present
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export { redis };

/**
 * Cache key prefixes
 */
export const CACHE_KEYS = {
  USER_ROLE: (userId: string) => `user:role:${userId}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  PRODUCTS_LIST: "products:list",
  CATEGORIES: "categories:all",
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  USER_ROLE: 300, // 5 minutes
  USER_PROFILE: 300, // 5 minutes
  PRODUCTS_LIST: 60, // 1 minute
  CATEGORIES: 600, // 10 minutes
} as const;

/**
 * Get cached value or fetch from source
 */
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  if (!redis) {
    // Redis not configured, bypass cache
    return fetcher();
  }

  try {
    // Try to get from cache
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache (don't await, fire and forget)
    redis.set(key, data, { ex: ttl }).catch(console.error);

    return data;
  } catch (error) {
    console.error("Redis cache error:", error);
    // Fallback to direct fetch on error
    return fetcher();
  }
}

/**
 * Invalidate a cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis invalidation error:", error);
  }
}

/**
 * Invalidate multiple cache keys by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis pattern invalidation error:", error);
  }
}
