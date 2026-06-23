/**
 * Core type definitions for the jueshi-audit tool.
 *
 * The audit tool runs a collection of TestSuites, each containing Checks
 * that verify HTTP-level behaviour (status codes, redirects, content).
 * Results are aggregated into an AuditReport for console + JSON output.
 */

import type { APIRequestContext } from '@playwright/test';

/** Severity level — P0 is the most critical (must-pass). */
export type Severity = 'P0' | 'P1' | 'P2';

/** Outcome of a single check. */
export type CheckStatus = 'pass' | 'fail' | 'skip' | 'error';

/** Result of a single check execution. */
export interface CheckResult {
  name: string;
  status: CheckStatus;
  severity: Severity;
  message: string;
  details?: Record<string, unknown>;
  durationMs: number;
}

/** Aggregated results for a TestSuite. */
export interface SuiteResult {
  suite: string;
  severity: Severity;
  results: CheckResult[];
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  durationMs: number;
}

/** Full audit report — serialised to JSON. */
export interface AuditReport {
  baseUrl: string;
  timestamp: string;
  durationMs: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
  };
  suites: SuiteResult[];
}

/**
 * Context passed to every Check.run() call.
 * Contains the shared Playwright APIRequestContext and config values.
 */
export interface CheckContext {
  baseUrl: string;
  timeout: number;
  verbose: boolean;
  request: APIRequestContext;
  log: (msg: string) => void;
}

/** A single audit check. */
export interface Check {
  name: string;
  severity: Severity;
  description?: string;
  run: (ctx: CheckContext) => Promise<CheckResult>;
}

/** A collection of related checks. */
export interface TestSuite {
  name: string;
  severity: Severity;
  description?: string;
  checks: Check[];
}
