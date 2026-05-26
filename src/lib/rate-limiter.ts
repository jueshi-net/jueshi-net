import { cache } from './cache';

interface RateLimitOptions {
  windowMs: number;     // Window size in milliseconds
  maxRequests: number;  // Max requests per window
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;        // Timestamp when window resets
}

/**
 * Sliding window rate limiter
 * Uses cache for distributed rate limiting (Redis-ready)
 */
export class RateLimiter {
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = options;
  }

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    const windowKey = `ratelimit:${key}:${Math.floor(now / this.options.windowMs)}`;

    // Get current count
    const currentCount = await cache.get<number>(windowKey) || 0;
    
    // Calculate reset time
    const reset = now + this.options.windowMs;

    if (currentCount >= this.options.maxRequests) {
      return {
        success: false,
        limit: this.options.maxRequests,
        remaining: 0,
        reset
      };
    }

    // Increment counter
    await cache.set(windowKey, currentCount + 1, Math.ceil(this.options.windowMs / 1000));

    return {
      success: true,
      limit: this.options.maxRequests,
      remaining: this.options.maxRequests - (currentCount + 1),
      reset
    };
  }

  /**
   * Create middleware helper for API routes
   */
  createMiddleware(keyFn?: (req: Request) => string) {
    return async (req: Request): Promise<RateLimitResult> => {
      const key = keyFn 
        ? keyFn(req) 
        : req.headers.get('x-forwarded-for') || req.headers.get('host') || 'unknown';
      
      return this.check(key);
    };
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // API general: 60 req/min
  api: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 60 }),
  
  // Auth endpoints: 5 req/5min
  auth: new RateLimiter({ windowMs: 5 * 60 * 1000, maxRequests: 5 }),
  
  // Export: 3 req/hour
  export: new RateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 3 }),
  
  // Search: 30 req/min
  search: new RateLimiter({ windowMs: 60 * 1000, maxRequests: 30 }),
  
  // Newsletter: 2 req/hour
  newsletter: new RateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 2 }),
};

// Named exports for convenience
export const authLimiter = rateLimiters.auth;
export const apiLimiter = rateLimiters.api;
export const searchLimiter = rateLimiters.search;

export default rateLimiters;
