import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '@/lib/rate-limiter';

type LimiterKey = keyof typeof rateLimiters;

/**
 * Apply rate limiting to API routes
 * Returns 429 if rate limit exceeded
 */
export function withRateLimiter(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiter: LimiterKey = 'api',
  keyExtractor?: (req: NextRequest) => string
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const key = keyExtractor 
      ? keyExtractor(req)
      : req.headers.get('x-forwarded-for') || 
        req.headers.get('host') || 
        'global';
    
    const result = await rateLimiters[limiter].check(key);

    const response = handler(req);

    // Add rate limit headers
    (await response).headers.set('X-RateLimit-Limit', result.limit.toString());
    (await response).headers.set('X-RateLimit-Remaining', result.remaining.toString());
    (await response).headers.set('X-RateLimit-Reset', result.reset.toString());

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    return response;
  };
}

export default withRateLimiter;
