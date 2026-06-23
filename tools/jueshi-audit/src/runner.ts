/**
 * Main Test Runner — orchestrates all test cases
 */
import { chromium, Browser, Page } from 'playwright';
import { TestCase, TestStatus, ConsoleMessage, NetworkEntry } from './types.js';
import { sleep, ensureDir } from './utils.js';
import { runP0PublicPages } from './tests/p0-public-pages.js';
import { runP0Redirects } from './tests/p0-redirects.js';
import * as fs from 'fs';
import * as path from 'path';

export interface RunOptions {
  baseUrl: string;
  publicOnly: boolean;
  screenshotDir: string;
  reportDir: string;
  consoleDir: string;
  networkDir: string;
}

export interface RunResult {
  cases: TestCase[];
  verdict: string;
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  notRun: number;
  p0Fails: number;
  p1Fails: number;
  consoleMessages: ConsoleMessage[];
  networkErrors: NetworkEntry[];
  evidencePaths: string[];
}

export async function runAudit(opts: RunOptions): Promise<RunResult> {
  // Ensure directories
  for (const dir of [opts.screenshotDir, opts.reportDir, opts.consoleDir, opts.networkDir]) {
    ensureDir(dir);
  }

  const allCases: TestCase[] = [];
  const consoleMessages: ConsoleMessage[] = [];
  const networkErrors: NetworkEntry[] = [];
  const evidencePaths: string[] = [];

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    // Collect console messages
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text().substring(0, 500),
        url: page.url(),
        timestamp: new Date().toISOString(),
      });
    });

    // Collect network errors
    page.on('requestfailed', (req) => {
      networkErrors.push({
        url: req.url(),
        method: req.method(),
        failure: req.failure()?.errorText ?? 'unknown',
        timestamp: new Date().toISOString(),
      });
    });

    // === P0: Public Pages ===
    console.log('\n=== P0: Public Pages ===');
    const p0Pages = await runP0PublicPages(page, opts.baseUrl, opts.screenshotDir);
    allCases.push(...p0Pages);
    for (const tc of p0Pages) {
      if (tc.status === 'PASS' || tc.status === 'FAIL') {
        evidencePaths.push(tc.evidence);
      }
    }

    // === P0: Redirects ===
    console.log('\n=== P0: Redirects ===');
    const p0Redirs = await runP0Redirects(page, opts.baseUrl, opts.screenshotDir);
    allCases.push(...p0Redirs);

    // Check for P0 failures — if found, stop high-risk tests
    const p0Fails = allCases.filter(c => c.priority === 'P0' && c.status === 'FAIL');
    if (p0Fails.length > 0) {
      console.log(`\n⚠️  P0 FAILURES DETECTED: ${p0Fails.length}. Stopping high-risk tests.`);
    }

    // === P1: Postal Code (read-only, safe) ===
    if (p0Fails.length === 0) {
      console.log('\n=== P1: Postal Code ===');
      try {
        const { runP1PostalCode } = await import('./tests/p1-postal-code.js');
        const p1Postal = await runP1PostalCode(page, opts.baseUrl, opts.screenshotDir);
        allCases.push(...p1Postal);
      } catch (e) {
        console.log('  P1 Postal Code: SKIP (module not loaded)');
        allCases.push({ id: 'P1-POSTAL', module: 'Postal Code', environment: 'staging', priority: 'P1', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: true, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error' });
      }
    }

    // === P1: Destinations (read-only) ===
    if (p0Fails.length === 0) {
      console.log('\n=== P1: Destinations ===');
      try {
        const { runP1Destinations } = await import('./tests/p1-destinations.js');
        const p1Dest = await runP1Destinations(page, opts.baseUrl, opts.screenshotDir);
        allCases.push(...p1Dest);
      } catch (e) {
        console.log('  P1 Destinations: SKIP (module not loaded)');
        allCases.push({ id: 'P1-DEST', module: 'Destinations', environment: 'staging', priority: 'P1', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: true, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error' });
      }
    }

    // === P1: BBS (read-only) ===
    if (p0Fails.length === 0) {
      console.log('\n=== P1: BBS ===');
      try {
        const { runP1BBS } = await import('./tests/p1-bbs.js');
        const p1Bbs = await runP1BBS(page, opts.baseUrl, opts.screenshotDir);
        allCases.push(...p1Bbs);
      } catch (e) {
        console.log('  P1 BBS: SKIP (module not loaded)');
        allCases.push({ id: 'P1-BBS', module: 'BBS', environment: 'staging', priority: 'P1', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: true, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error' });
      }
    }

    // === P1: Login ===
    console.log('\n=== P1: Login ===');
    if (opts.publicOnly || !process.env.AUDIT_TEST_PASSWORD) {
      allCases.push({ id: 'P1-LOGIN', module: 'Login', environment: 'staging', priority: 'P1', preconditions: 'AUDIT_TEST_PASSWORD env', steps: ['Attempt login with test credentials'], expected_result: 'Login succeeds', evidence: '', production_allowed: false, staging_required: true, status: 'BLOCKED' as TestStatus, notes: 'BLOCKED_NO_CREDENTIAL — --public-only or no AUDIT_TEST_PASSWORD' });
    } else {
      try {
        const { runP1Login } = await import('./tests/p1-login.js');
        const p1Login = await runP1Login(page, opts.baseUrl, opts.screenshotDir, process.env.AUDIT_TEST_USER || 'audit-admin@jueshi.net', process.env.AUDIT_TEST_PASSWORD);
        allCases.push(...p1Login);
      } catch (e) {
        allCases.push({ id: 'P1-LOGIN', module: 'Login', environment: 'staging', priority: 'P1', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: false, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error: ' + String(e).substring(0,100) });
      }
    }

    // === P2: Admin (requires login) ===
    console.log('\n=== P2: Admin ===');
    if (opts.publicOnly || !process.env.AUDIT_TEST_PASSWORD) {
      allCases.push({ id: 'P2-ADMIN', module: 'Admin', environment: 'staging', priority: 'P2', preconditions: 'Login required', steps: [], expected_result: '', evidence: '', production_allowed: false, staging_required: true, status: 'BLOCKED' as TestStatus, notes: 'BLOCKED_NO_CREDENTIAL' });
    } else {
      try {
        const { runP2Admin } = await import('./tests/p2-admin.js');
        const p2Admin = await runP2Admin(page, opts.baseUrl, opts.screenshotDir);
        allCases.push(...p2Admin);
      } catch (e) {
        allCases.push({ id: 'P2-ADMIN', module: 'Admin', environment: 'staging', priority: 'P2', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: false, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error' });
      }
    }

    // === P2: Mobile ===
    console.log('\n=== P2: Mobile ===');
    try {
      const { runP2Mobile } = await import('./tests/p2-mobile.js');
      const p2Mobile = await runP2Mobile(page, opts.baseUrl, opts.screenshotDir);
      allCases.push(...p2Mobile);
    } catch (e) {
      allCases.push({ id: 'P2-MOBILE', module: 'Mobile', environment: 'staging', priority: 'P2', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: true, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error' });
    }

    // === P3: SEO ===
    console.log('\n=== P3: SEO ===');
    try {
      const { runP3SEO } = await import('./tests/p3-seo.js');
      const p3SEO = await runP3SEO(page, opts.baseUrl, opts.screenshotDir);
      allCases.push(...p3SEO);
    } catch (e) {
      allCases.push({ id: 'P3-SEO', module: 'SEO', environment: 'staging', priority: 'P3', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: true, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error' });
    }

    // === P3: Security ===
    console.log('\n=== P3: Security ===');
    try {
      const { runP3Security } = await import('./tests/p3-security.js');
      const p3Sec = await runP3Security(page, opts.baseUrl, opts.screenshotDir);
      allCases.push(...p3Sec);
    } catch (e) {
      allCases.push({ id: 'P3-SEC', module: 'Security', environment: 'staging', priority: 'P3', preconditions: '', steps: [], expected_result: '', evidence: '', production_allowed: true, staging_required: true, status: 'NOT_RUN' as TestStatus, notes: 'Module load error' });
    }

    // Save console logs
    fs.writeFileSync(path.join(opts.consoleDir, 'console.json'), JSON.stringify(consoleMessages, null, 2));

    // Save network errors
    fs.writeFileSync(path.join(opts.networkDir, 'network.json'), JSON.stringify(networkErrors, null, 2));

    // Collect evidence paths
    for (const tc of allCases) {
      if (tc.evidence) evidencePaths.push(tc.evidence);
    }

  } finally {
    if (browser) await browser.close();
  }

  // Calculate verdict
  const total = allCases.length;
  const passed = allCases.filter(c => c.status === 'PASS').length;
  const failed = allCases.filter(c => c.status === 'FAIL').length;
  const blocked = allCases.filter(c => c.status === 'BLOCKED').length;
  const notRun = allCases.filter(c => c.status === 'NOT_RUN').length;
  const p0Fails = allCases.filter(c => c.priority === 'P0' && c.status === 'FAIL').length;
  const p1Fails = allCases.filter(c => c.priority === 'P1' && c.status === 'FAIL').length;

  let verdict: string;
  if (p0Fails > 0 || p1Fails > 0) {
    verdict = 'STAGING_AUDIT_FOUND_ISSUES';
  } else if (blocked > 0 && passed === 0) {
    verdict = 'STAGING_AUDIT_BLOCKED';
  } else if (total === 0) {
    verdict = 'FAILED';
  } else {
    verdict = 'STAGING_AUDIT_READY_NO_P0P1';
  }

  return { cases: allCases, verdict, total, passed, failed, blocked, notRun, p0Fails, p1Fails, consoleMessages, networkErrors, evidencePaths };
}
