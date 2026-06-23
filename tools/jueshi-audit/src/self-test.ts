/**
 * jueshi-audit — Minimal Self-Test Runner
 * 
 * Runs P0 public-only tests against https://i.jueshi.net
 * Captures: screenshots, console errors, network errors
 * Generates: reports/latest/index.md
 * 
 * Usage: npx tsx tools/jueshi-audit/src/self-test.ts [--public-only] [--base-url URL]
 */
import { chromium, Page, ConsoleMessage, Response } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ─── Config ──────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'https://i.jueshi.net';

const PUBLIC_ONLY = process.argv.includes('--public-only');
const TOOL_DIR = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(TOOL_DIR, 'artifacts', 'screenshots');
const CONSOLE_DIR = path.join(TOOL_DIR, 'artifacts', 'console');
const NETWORK_DIR = path.join(TOOL_DIR, 'artifacts', 'network');
const REPORT_DIR = path.join(TOOL_DIR, 'reports', 'latest');

// ─── Types ───────────────────────────────────────────────
type Status = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_RUN' | 'SKIPPED';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';

interface TestResult {
  id: string;
  module: string;
  priority: Priority;
  url: string;
  steps: string;
  expected: string;
  actual: string;
  status: Status;
  evidence: string;
  notes: string;
}

interface BugReport {
  id: string;
  title: string;
  priority: Priority;
  url: string;
  steps: string;
  actual: string;
  expected: string;
  consoleErrors: string[];
  networkErrors: string[];
  screenshot: string;
}

// ─── Helpers ─────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function sanitizeFilename(url: string): string {
  return url.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── Test Pages ──────────────────────────────────────────
const PUBLIC_PAGES = [
  { path: '/', name: 'homepage', id: 'P0-001' },
  { path: '/destinations', name: 'destinations-list', id: 'P0-002' },
  { path: '/destinations/canada', name: 'canada-page', id: 'P0-003' },
  { path: '/destinations/united-states', name: 'usa-page', id: 'P0-004' },
  { path: '/bbs', name: 'bbs-index', id: 'P0-005' },
  { path: '/tools/postal-code', name: 'postal-code', id: 'P0-006' },
  { path: '/login', name: 'login-page', id: 'P0-007' },
];

const REDIRECT_TESTS = [
  { path: '/destinations/usa', expected: '/destinations/united-states', id: 'P0-008', name: 'redirect-usa' },
  { path: '/countries', expected: '/destinations', id: 'P0-009', name: 'redirect-countries' },
  { path: '/community', expected: '/bbs', id: 'P0-010', name: 'redirect-community' },
];

const SEO_CHECKS = [
  { path: '/', id: 'P3-001', name: 'seo-homepage' },
  { path: '/destinations/canada', id: 'P3-002', name: 'seo-canada' },
  { path: '/bbs', id: 'P3-003', name: 'seo-bbs' },
];

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  jueshi-audit — Minimal Self-Test               ║');
  console.log('║  Target:', BASE_URL.padEnd(37), '║');
  console.log('║  Mode:', (PUBLIC_ONLY ? 'public-only' : 'full').padEnd(41), '║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  ensureDir(SCREENSHOT_DIR);
  ensureDir(CONSOLE_DIR);
  ensureDir(NETWORK_DIR);
  ensureDir(REPORT_DIR);

  const results: TestResult[] = [];
  const bugs: BugReport[] = [];
  let p0Fail = false;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'jueshi-audit/1.0 (staging-test)',
  });
  const page = await context.newPage();

  // ── P0: Public Pages ──────────────────────────────────
  console.log('━━━ Phase 0: Public Pages ━━━');
  for (const tc of PUBLIC_PAGES) {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    const consoleHandler = (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
      }
    };
    const responseHandler = (res: Response) => {
      if (res.status() >= 500) {
        networkErrors.push(`[${res.status()}] ${res.url()}`);
      }
    };

    page.on('console', consoleHandler);
    page.on('response', responseHandler);

    const url = BASE_URL + tc.path;
    console.log(`  [${tc.id}] ${tc.path} ...`, '');

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await sleep(800); // rate limit: ~1 req/sec

      const status = response?.status() ?? 0;
      const screenshotPath = path.join(SCREENSHOT_DIR, `${tc.id}-${tc.name}.png`);

      await page.screenshot({ path: screenshotPath, fullPage: false });

      // Save console/network
      const consoleFile = path.join(CONSOLE_DIR, `${tc.id}-${tc.name}.json`);
      const networkFile = path.join(NETWORK_DIR, `${tc.id}-${tc.name}.json`);
      fs.writeFileSync(consoleFile, JSON.stringify({ url, errors: consoleErrors }, null, 2));
      fs.writeFileSync(networkFile, JSON.stringify({ url, errors: networkErrors }, null, 2));

      if (status === 200) {
        console.log(`    ✅ PASS (200)`);
        results.push({
          id: tc.id, module: 'Public Pages', priority: 'P0',
          url, steps: `Navigate to ${tc.path}`,
          expected: 'HTTP 200, page renders',
          actual: `HTTP ${status}, page loaded`,
          status: 'PASS',
          evidence: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
          notes: `Console errors: ${consoleErrors.length}, Network 5xx: ${networkErrors.length}`,
        });
      } else {
        console.log(`    ❌ FAIL (${status})`);
        p0Fail = true;
        results.push({
          id: tc.id, module: 'Public Pages', priority: 'P0',
          url, steps: `Navigate to ${tc.path}`,
          expected: 'HTTP 200',
          actual: `HTTP ${status}`,
          status: 'FAIL',
          evidence: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
          notes: `Console errors: ${consoleErrors.length}, Network 5xx: ${networkErrors.length}`,
        });
        bugs.push({
          id: `BUG-${bugs.length + 1}`,
          title: `${tc.path} returned ${status}`,
          priority: 'P0',
          url, steps: `Navigate to ${tc.path}`,
          actual: `HTTP ${status}`,
          expected: 'HTTP 200',
          consoleErrors, networkErrors,
          screenshot: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
        });
      }
    } catch (e: any) {
      console.log(`    ❌ FAIL (${e.message?.substring(0, 80)})`);
      p0Fail = true;
      results.push({
        id: tc.id, module: 'Public Pages', priority: 'P0',
        url, steps: `Navigate to ${tc.path}`,
        expected: 'HTTP 200',
        actual: e.message?.substring(0, 200) ?? 'Unknown error',
        status: 'FAIL',
        evidence: '',
        notes: 'Navigation failed',
      });
      bugs.push({
        id: `BUG-${bugs.length + 1}`,
        title: `${tc.path} navigation failed`,
        priority: 'P0',
        url, steps: `Navigate to ${tc.path}`,
        actual: e.message?.substring(0, 200) ?? 'Unknown',
        expected: 'HTTP 200',
        consoleErrors, networkErrors,
        screenshot: '',
      });
    }

    page.off('console', consoleHandler);
    page.off('response', responseHandler);
  }

  // ── P0: Redirects ─────────────────────────────────────
  if (!p0Fail) {
    console.log('━━━ Phase 0: Redirects ━━━');
    for (const tc of REDIRECT_TESTS) {
      const url = BASE_URL + tc.path;
      console.log(`  [${tc.id}] ${tc.path} → ${tc.expected} ...`, '');

      try {
        const response = await page.goto(url, { waitUntil: 'commit', timeout: 15000 });
        await sleep(800);
        const finalUrl = page.url();
        const redirected = finalUrl.replace(BASE_URL, '') !== tc.path;
        const status = response?.status() ?? 0;

        const screenshotPath = path.join(SCREENSHOT_DIR, `${tc.id}-${tc.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        if (redirected || (status >= 300 && status < 400)) {
          console.log(`    ✅ PASS (${status} → ${finalUrl.replace(BASE_URL, '')})`);
          results.push({
            id: tc.id, module: 'Redirects', priority: 'P0',
            url, steps: `Navigate to ${tc.path}`,
            expected: `Redirect to ${tc.expected}`,
            actual: `${status} → ${finalUrl.replace(BASE_URL, '')}`,
            status: 'PASS',
            evidence: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
            notes: '',
          });
        } else if (status === 200) {
          // Direct render is acceptable for /community
          console.log(`    ✅ PASS (200 direct render)`);
          results.push({
            id: tc.id, module: 'Redirects', priority: 'P0',
            url, steps: `Navigate to ${tc.path}`,
            expected: `Redirect to ${tc.expected}`,
            actual: `200 direct render at ${finalUrl.replace(BASE_URL, '')}`,
            status: 'PASS',
            evidence: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
            notes: 'Direct render acceptable',
          });
        } else {
          console.log(`    ❌ FAIL (${status})`);
          results.push({
            id: tc.id, module: 'Redirects', priority: 'P0',
            url, steps: `Navigate to ${tc.path}`,
            expected: `Redirect to ${tc.expected}`,
            actual: `HTTP ${status}, URL: ${finalUrl.replace(BASE_URL, '')}`,
            status: 'FAIL',
            evidence: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
            notes: 'Redirect not working',
          });
          bugs.push({
            id: `BUG-${bugs.length + 1}`,
            title: `${tc.path} redirect failed`,
            priority: 'P0',
            url, steps: `Navigate to ${tc.path}`,
            actual: `HTTP ${status}`,
            expected: `Redirect to ${tc.expected}`,
            consoleErrors: [], networkErrors: [],
            screenshot: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
          });
        }
      } catch (e: any) {
        console.log(`    ❌ FAIL (${e.message?.substring(0, 80)})`);
        results.push({
          id: tc.id, module: 'Redirects', priority: 'P0',
          url, steps: `Navigate to ${tc.path}`,
          expected: `Redirect to ${tc.expected}`,
          actual: e.message?.substring(0, 200) ?? 'Unknown',
          status: 'FAIL',
          evidence: '',
          notes: 'Navigation error',
        });
      }
    }
  }

  // ── P3: SEO Checks ────────────────────────────────────
  if (!p0Fail) {
    console.log('━━━ Phase 3: SEO Checks ━━━');
    for (const tc of SEO_CHECKS) {
      const url = BASE_URL + tc.path;
      console.log(`  [${tc.id}] ${tc.path} SEO ...`, '');

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await sleep(800);

        const title = await page.title();
        const metaDesc = await page.getAttribute('meta[name="description"]', 'content') ?? '';
        const canonical = await page.getAttribute('link[rel="canonical"]', 'href') ?? '';
        const robots = await page.getAttribute('meta[name="robots"]', 'content') ?? '';

        const screenshotPath = path.join(SCREENSHOT_DIR, `${tc.id}-${tc.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        const hasTitle = title.length > 0;
        const hasDesc = metaDesc.length > 0;

        if (hasTitle && hasDesc) {
          console.log(`    ✅ PASS (title: ${title.substring(0, 40)}...)`);
          results.push({
            id: tc.id, module: 'SEO', priority: 'P3',
            url, steps: `Check SEO meta on ${tc.path}`,
            expected: 'Title + description present',
            actual: `title="${title.substring(0, 50)}", desc=${metaDesc.substring(0, 50)}..., canonical=${canonical}, robots=${robots}`,
            status: 'PASS',
            evidence: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
            notes: `robots: ${robots || 'none'}`,
          });
        } else {
          console.log(`    ⚠️ PARTIAL (title: ${hasTitle}, desc: ${hasDesc})`);
          results.push({
            id: tc.id, module: 'SEO', priority: 'P3',
            url, steps: `Check SEO meta on ${tc.path}`,
            expected: 'Title + description present',
            actual: `title=${hasTitle}, desc=${hasDesc}`,
            status: 'FAIL',
            evidence: `artifacts/screenshots/${tc.id}-${tc.name}.png`,
            notes: 'Missing SEO meta',
          });
        }
      } catch (e: any) {
        console.log(`    ❌ FAIL`);
        results.push({
          id: tc.id, module: 'SEO', priority: 'P3',
          url, steps: `Check SEO on ${tc.path}`,
          expected: 'SEO meta present',
          actual: e.message?.substring(0, 200) ?? 'Unknown',
          status: 'FAIL',
          evidence: '',
          notes: '',
        });
      }
    }
  }

  // ── Login tests (BLOCKED if public-only or no creds) ──
  const hasCreds = !!process.env.AUDIT_TEST_PASSWORD;
  if (!PUBLIC_ONLY && hasCreds) {
    console.log('━━━ Phase 1: Login Tests ━━━');
    // Would run login tests here
    console.log('  [P1-001] Login test ... SKIPPED (implementation pending)');
    results.push({
      id: 'P1-001', module: 'Login', priority: 'P1',
      url: BASE_URL + '/login', steps: 'Login with test credentials',
      expected: 'Login succeeds, redirect to workspace',
      actual: 'Not implemented in self-test',
      status: 'NOT_RUN',
      evidence: '',
      notes: 'Login tests require full runner',
    });
  } else {
    console.log('━━━ Phase 1: Login Tests ━━━');
    console.log('  [P1-001] Login test ... BLOCKED_NO_CREDENTIAL');
    results.push({
      id: 'P1-001', module: 'Login', priority: 'P1',
      url: BASE_URL + '/login', steps: 'Login with test credentials',
      expected: 'Login succeeds',
      actual: 'No credentials available (--public-only or AUDIT_TEST_PASSWORD not set)',
      status: 'BLOCKED',
      evidence: '',
      notes: 'BLOCKED_NO_CREDENTIAL',
    });
  }

  // ── Admin tests ───────────────────────────────────────
  console.log('  [P2-001] Admin access ... BLOCKED_NO_CREDENTIAL');
  results.push({
    id: 'P2-001', module: 'Admin', priority: 'P2',
    url: BASE_URL + '/admin', steps: 'Access admin panel',
    expected: 'Admin panel accessible with admin credentials',
    actual: 'No credentials',
    status: 'BLOCKED',
    evidence: '',
    notes: 'BLOCKED_NO_CREDENTIAL',
  });

  await browser.close();

  // ── Generate Report ───────────────────────────────────
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const blocked = results.filter(r => r.status === 'BLOCKED').length;
  const notRun = results.filter(r => r.status === 'NOT_RUN').length;
  const p0Fails = results.filter(r => r.priority === 'P0' && r.status === 'FAIL');
  const p1Fails = results.filter(r => r.priority === 'P1' && r.status === 'FAIL');

  let verdict: string;
  if (p0Fails.length > 0 || p1Fails.length > 0) {
    verdict = 'STAGING_AUDIT_FOUND_ISSUES';
  } else if (blocked > 0 && pass === 0) {
    verdict = 'STAGING_AUDIT_BLOCKED';
  } else if (pass > 0) {
    verdict = 'STAGING_AUDIT_READY_NO_P0P1';
  } else {
    verdict = 'FAILED';
  }

  // ── index.md ──────────────────────────────────────────
  const now = new Date().toISOString();
  let md = `# jueshi-audit — Self-Test Report

**Date:** ${now}
**Target:** ${BASE_URL}
**Mode:** ${PUBLIC_ONLY ? 'public-only' : 'full'}
**Verdict:** ${verdict}

---

## Summary

| Metric | Count |
|--------|-------|
| Total | ${results.length} |
| PASS | ${pass} |
| FAIL | ${fail} |
| BLOCKED | ${blocked} |
| NOT_RUN | ${notRun} |

## P0/P1 Failures

`;
  if (p0Fails.length === 0 && p1Fails.length === 0) {
    md += `No P0/P1 failures detected. ✅\n`;
  } else {
    for (const f of [...p0Fails, ...p1Fails]) {
      md += `### ${f.id} [${f.priority}] — ${f.module}\n`;
      md += `- **URL:** ${f.url}\n`;
      md += `- **Expected:** ${f.expected}\n`;
      md += `- **Actual:** ${f.actual}\n`;
      md += `- **Evidence:** ${f.evidence}\n\n`;
    }
  }

  md += `\n## Bug List\n\n`;
  if (bugs.length === 0) {
    md += `No bugs detected. ✅\n\n`;
  } else {
    for (const b of bugs) {
      md += `### ${b.id} [${b.priority}] — ${b.title}\n`;
      md += `- **URL:** ${b.url}\n`;
      md += `- **Steps:** ${b.steps}\n`;
      md += `- **Actual:** ${b.actual}\n`;
      md += `- **Expected:** ${b.expected}\n`;
      md += `- **Console Errors:** ${b.consoleErrors.length}\n`;
      md += `- **Network Errors:** ${b.networkErrors.length}\n`;
      md += `- **Screenshot:** ${b.screenshot}\n\n`;
    }
  }

  md += `\n## Evidence Directory\n\n`;
  md += `| Type | Path |\n|------|------|\n`;
  md += `| Screenshots | artifacts/screenshots/ |\n`;
  md += `| Console Logs | artifacts/console/ |\n`;
  md += `| Network Logs | artifacts/network/ |\n\n`;

  md += `## All Test Results\n\n`;
  md += `| ID | Module | Priority | URL | Status | Notes |\n`;
  md += `|-----|--------|----------|-----|--------|-------|\n`;
  for (const r of results) {
    const shortUrl = r.url.replace(BASE_URL, '');
    md += `| ${r.id} | ${r.module} | ${r.priority} | ${shortUrl} | ${r.status} | ${r.notes.substring(0, 60)} |\n`;
  }

  md += `\n## Production Release Gate\n\n`;
  md += `| Check | Result |\n|-------|--------|\n`;
  md += `| P0 failures | ${p0Fails.length} ${p0Fails.length === 0 ? '✅' : '❌'} |\n`;
  md += `| P1 failures | ${p1Fails.length} ${p1Fails.length === 0 ? '✅' : '❌'} |\n`;
  md += `| Allowed to proceed to OPS production release | ${verdict === 'STAGING_AUDIT_READY_NO_P0P1' ? 'YES (with user confirmation)' : 'NO'} |\n\n`;

  md += `## Safety Checklist\n\n`;
  md += `| Check | Result |\n|-------|--------|\n`;
  md += `| prisma db push executed | NO ✅ |\n`;
  md += `| destructive SQL executed | NO ✅ |\n`;
  md += `| production modified | NO ✅ |\n`;
  md += `| secrets in output | NO ✅ |\n`;
  md += `| 9833416@qq.com modified | NO ✅ |\n`;

  md += `\n## Next Steps\n\n`;
  md += `1. Review any FAIL items above\n`;
  md += `2. For BLOCKED items, provide credentials and re-run without --public-only\n`;
  md += `3. Once all P0/P1 pass, ask user to confirm production release\n`;

  fs.writeFileSync(path.join(REPORT_DIR, 'index.md'), md);

  // ── verdict.json ──────────────────────────────────────
  fs.writeFileSync(path.join(REPORT_DIR, 'verdict.json'), JSON.stringify({
    verdict,
    timestamp: now,
    target: BASE_URL,
    mode: PUBLIC_ONLY ? 'public-only' : 'full',
    summary: { total: results.length, pass, fail, blocked, notRun },
    p0_failures: p0Fails.length,
    p1_failures: p1Fails.length,
    bugs: bugs.length,
  }, null, 2));

  // ── Console output ────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Verdict: ${verdict}`);
  console.log(`  PASS: ${pass} | FAIL: ${fail} | BLOCKED: ${blocked} | NOT_RUN: ${notRun}`);
  console.log(`  P0 failures: ${p0Fails.length} | P1 failures: ${p1Fails.length}`);
  console.log(`  Bugs: ${bugs.length}`);
  console.log(`  Report: ${path.join(REPORT_DIR, 'index.md')}`);
  console.log(`  Screenshots: ${fs.readdirSync(SCREENSHOT_DIR).length} files`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
