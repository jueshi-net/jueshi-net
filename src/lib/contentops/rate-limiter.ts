// ContentOps V1 — Rate Limiter & Recovery
// 429 处理、暂停、恢复

import { RateLimitState } from './types';

export interface RateLimiterConfig {
  maxRetries: number;
  pauseDurationMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRetries: 5,
  pauseDurationMs: 30 * 60 * 1000, // 30 minutes
  backoffMultiplier: 2,
  maxBackoffMs: 60 * 60 * 1000, // 1 hour max
};

/**
 * Rate limiter state - persisted to database
 */
export class RateLimiter {
  private config: RateLimiterConfig;
  private state: RateLimitState;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      paused: false,
    };
  }

  /**
   * Load state from persistent storage
   */
  loadState(savedState: RateLimitState | null): void {
    if (savedState) {
      this.state = { ...savedState };
      // Check if pause has expired
      if (this.state.paused && this.state.resumeAt) {
        if (new Date() >= this.state.resumeAt) {
          this.state.paused = false;
          this.state.resumeAt = undefined;
          this.state.reason = undefined;
        }
      }
    }
  }

  /**
   * Get current state for persistence
   */
  getState(): RateLimitState {
    return { ...this.state };
  }

  /**
   * Check if operations are currently paused
   */
  isPaused(): boolean {
    if (!this.state.paused) return false;
    
    // Check if pause has expired
    if (this.state.resumeAt && new Date() >= this.state.resumeAt) {
      this.state.paused = false;
      this.state.resumeAt = undefined;
      this.state.reason = undefined;
      return false;
    }
    
    return true;
  }

  /**
   * Get time remaining until resume
   */
  getResumeIn(): number | null {
    if (!this.state.paused || !this.state.resumeAt) return null;
    const remaining = this.state.resumeAt.getTime() - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Get formatted resume time
   */
  getResumeTimeFormatted(): string | null {
    const remaining = this.getResumeIn();
    if (remaining === null) return null;
    
    const minutes = Math.ceil(remaining / 60000);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Pause operations due to rate limit (429)
   */
  pause(reason: string, retryAfterSeconds?: number): void {
    const pauseDuration = retryAfterSeconds 
      ? retryAfterSeconds * 1000 
      : this.config.pauseDurationMs;
    
    this.state = {
      paused: true,
      pausedAt: new Date(),
      resumeAt: new Date(Date.now() + pauseDuration),
      reason,
      retryAfter: retryAfterSeconds,
    };
  }

  /**
   * Resume operations manually
   */
  resume(): void {
    this.state = {
      paused: false,
    };
  }

  /**
   * Get pause reason
   */
  getPauseReason(): string | undefined {
    return this.state.reason;
  }

  /**
   * Calculate backoff delay for retries
   */
  getBackoffDelay(attempt: number): number {
    const delay = this.config.backoffMultiplier ** attempt * 1000;
    return Math.min(delay, this.config.maxBackoffMs);
  }

  /**
   * Check if max retries exceeded
   */
  isMaxRetriesExceeded(currentRetries: number): boolean {
    return currentRetries >= this.config.maxRetries;
  }

  /**
   * Get max retries config
   */
  getMaxRetries(): number {
    return this.config.maxRetries;
  }
}

/**
 * Parse Retry-After header value
 */
export function parseRetryAfter(headerValue: string | null): number | null {
  if (!headerValue) return null;
  
  // Try parsing as seconds (integer)
  const seconds = parseInt(headerValue, 10);
  if (!isNaN(seconds)) return seconds;
  
  // Try parsing as HTTP date
  const date = new Date(headerValue);
  if (!isNaN(date.getTime())) {
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
  }
  
  return null;
}

/**
 * Create rate limit error message for user display
 */
export function formatRateLimitMessage(
  resumeIn: string | null,
  reason?: string
): string {
  const parts: string[] = ['⏸️ 操作已暂停'];
  
  if (reason) {
    parts.push(`原因: ${reason}`);
  }
  
  if (resumeIn) {
    parts.push(`将在 ${resumeIn} 后自动恢复`);
  }
  
  return parts.join('\n');
}
