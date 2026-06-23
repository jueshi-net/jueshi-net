/**
 * Utility functions for the jueshi-audit tool.
 *
 * Includes HTTP request helpers (via Playwright's request API),
 * result constructors, URL normalisation, content validation,
 * and console formatting (ANSI colours, icons).
 */

import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { CheckResult, CheckStatus, Severity } from './types.js';

// ── ANSI colours ──────────────────────────────────────────────

const COLORS: Record<string, string> = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

export function colorText(text: string, color: string): string {
  if (!useColor) return text;
  return `${COLORS[color] ?? ''}${text}${COLORS.reset}`;
}

export function statusIcon(status: CheckStatus): string {
  switch (status) {
    case 'pass':
      return colorText('✅', 'green');
    case 'fail':
      return colorText('❌', 'red');
    case 'skip':
      return colorText('⏭️', 'yellow');
    case 'error':
      return colorText('💥', 'red');
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Result constructors ───────────────────────────────────────

export function pass(
  name: string,
  severity: Severity,
  message: string,
  durationMs: number,
  details?: Record<string, unknown>,
): CheckResult {
  return { name, status: 'pass', severity, message, durationMs, details };
}

export function fail(
  name: string,
  severity: Severity,
  message: string,
  durationMs: number,
  details?: Record<string, unknown>,
): CheckResult {
  return { name, status: 'fail', severity, message, durationMs, details };
}

export function skipResult(
  name: string,
  severity: Severity,
  message: string,
  durationMs: number,
): CheckResult {
  return { name, status: 'skip', severity, message, durationMs };
}

export function errorResult(
  name: string,
  severity: Severity,
  message: string,
  durationMs: number,
  details?: Record<string, unknown>,
): CheckResult {
  return { name, status: 'error', severity, message, durationMs, details };
}

// ── URL helpers ───────────────────────────────────────────────

/**
 * Normalise a Location header value to a pathname + search string.
 * Handles both absolute URLs and relative paths.
 */
export function normalizeLocation(location: string, baseUrl: string): string {
  try {
    const url = new URL(location, baseUrl);
    return url.pathname + url.search;
  } catch {
    return location;
  }
}

// ── HTTP helpers ──────────────────────────────────────────────

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  response: APIResponse;
}

/**
 * Perform a GET request via Playwright's request API.
 *
 * By default does NOT follow redirects (maxRedirects: 0) so the
 * caller can inspect raw redirect responses. Set `followRedirects`
 * to follow the default 20-redirect chain.
 */
export async function httpGet(
  request: APIRequestContext,
  path: string,
  options?: {
    maxRedirects?: number;
    timeout?: number;
    followRedirects?: boolean;
  },
): Promise<HttpResponse> {
  const response = await request.get(path, {
    maxRedirects: options?.followRedirects ? undefined : (options?.maxRedirects ?? 0),
    timeout: options?.timeout,
    headers: {
      'User-Agent': 'jueshi-audit/1.0 (read-only site audit)',
    },
  });

  const status = response.status();
  const headers = response.headers();
  const body = await response.text().catch(() => '');

  return { status, headers, body, response };
}

// ── Content validation ────────────────────────────────────────

/**
 * Strings that indicate a Next.js error page rather than real content.
 * These are specific enough to avoid false positives on legitimate pages.
 */
const ERROR_INDICATORS = [
  'Application error',
  'Internal Server Error',
  'This page could not be found',
  'Something went wrong',
  'UNHANDLED_EXCEPTION',
];

/**
 * Validate that an HTTP response body looks like real HTML content
 * (not an error page, not an empty response).
 */
export function hasValidHtmlContent(body: string): {
  valid: boolean;
  reason?: string;
} {
  if (body.length < 200) {
    return {
      valid: false,
      reason: `Response body too short (${body.length} bytes)`,
    };
  }

  if (!body.includes('<html') && !body.includes('<!DOCTYPE')) {
    return { valid: false, reason: 'Response is not valid HTML' };
  }

  for (const indicator of ERROR_INDICATORS) {
    if (body.includes(indicator)) {
      return {
        valid: false,
        reason: `Response contains error indicator: "${indicator}"`,
      };
    }
  }

  return { valid: true };
}
