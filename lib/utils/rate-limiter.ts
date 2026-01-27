/**
 * Rate limiter with Redis support for production environments
 * Falls back to in-memory storage when Redis is not configured
 */

import Redis from 'ioredis';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

// In-memory fallback storage
interface RateLimitEntry {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Redis client singleton
let redisClient: Redis | null = null;
let redisConnectionFailed = false;

function getRedisClient(): Redis | null {
  if (redisConnectionFailed) {
    return null;
  }

  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        retryStrategy: (times) => {
          if (times > 3) return null; // Stop retrying after 3 attempts
          return Math.min(times * 100, 2000);
        },
      });

      redisClient.on('error', (err) => {
        console.error('Redis connection error:', err.message);
        redisConnectionFailed = true;
        redisClient = null;
      });

      redisClient.on('connect', () => {
        console.log('Redis connected for rate limiting');
        redisConnectionFailed = false;
      });

      // Attempt to connect
      redisClient.connect().catch((err) => {
        console.error('Redis connection failed:', err.message);
        redisConnectionFailed = true;
        redisClient = null;
      });
    } catch (err) {
      console.error('Redis initialization error:', err);
      redisConnectionFailed = true;
      return null;
    }
  }

  return redisClient;
}

/**
 * Redis-based rate limiting using sliding window algorithm
 */
async function redisRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis || redisConnectionFailed) {
    // Fall back to in-memory
    return inMemoryRateLimit(identifier, config);
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Use Redis transaction for atomic operations
    const pipeline = redis.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Count current entries in the window
    pipeline.zcard(key);

    // Add current request with timestamp as score
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiry on the key
    pipeline.pexpire(key, config.windowMs);

    const results = await pipeline.exec();

    if (!results) {
      return inMemoryRateLimit(identifier, config);
    }

    // Get the count before adding the current request
    const count = (results[1]?.[1] as number) || 0;

    if (count >= config.maxRequests) {
      // Get oldest entry to calculate reset time
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const oldestTime = oldest.length >= 2 ? parseInt(oldest[1]) : now;
      const resetIn = Math.max(0, config.windowMs - (now - oldestTime));

      return {
        success: false,
        remaining: 0,
        resetIn,
      };
    }

    return {
      success: true,
      remaining: config.maxRequests - count - 1,
      resetIn: config.windowMs,
    };
  } catch (err) {
    console.error('Redis rate limit error:', err);
    // Fall back to in-memory on error
    return inMemoryRateLimit(identifier, config);
  }
}

/**
 * In-memory rate limiting (fallback)
 */
function inMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now - entry.lastReset > config.windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: config.windowMs - (now - entry.lastReset),
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: config.windowMs - (now - entry.lastReset),
  };
}

/**
 * Main rate limit function - uses Redis if available, falls back to in-memory
 */
export async function rateLimitAsync(
  identifier: string,
  config: RateLimitConfig = {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '10'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  }
): Promise<RateLimitResult> {
  if (process.env.REDIS_URL && !redisConnectionFailed) {
    return redisRateLimit(identifier, config);
  }
  return inMemoryRateLimit(identifier, config);
}

/**
 * Synchronous rate limit function (in-memory only)
 * @deprecated Use rateLimitAsync for production with Redis support
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '10'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  }
): RateLimitResult {
  return inMemoryRateLimit(identifier, config);
}

/**
 * Check if Redis is being used for rate limiting
 */
export function isUsingRedis(): boolean {
  return !!process.env.REDIS_URL && !redisConnectionFailed && !!redisClient;
}

// Cleanup old in-memory entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

    Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
      if (now - entry.lastReset > windowMs * 2) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  const cleanup = () => {
    if (redisClient) {
      redisClient.quit().catch(() => {});
    }
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}
