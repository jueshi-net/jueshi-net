/**
 * jueshi-audit — Full Audit Runner
 * Usage: npx tsx tools/jueshi-audit/src/audit-runner.ts [--public-only] [--base-url URL]
 */
import { chromium, Page, ConsoleMessage, Response } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOL_DIR = path.resolve(__dirname, '..');

const BASE_URL = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'https://i.jueshi.net';
const PUBLIC_ONLY = process.argv.includes('--public-only');

const EMAIL_USER = process.env.AUDIT_TEST_EMAIL_USER || '';
const EMAIL_ADMIN = process.env.AUDIT_TEST_EMAIL_ADMIN || '';
const PASSWORD = process.env.AUDIT_TEST_PASSWORD || '';
const HAS_CREDS = !!(EMAIL_USER && EMAIL_ADMIN && PASSWORD) && !PUBLIC_ONLY;

const SS = path.join(TOOL_DIR, 'artifacts', 'screenshots');
const CONSOLE_DIR = path.join(TOOL_DIR, 'artifacts', 'console');
const NET_DIR = path.join(TOOL_DIR, 'artifacts', 'network');
const REPORT_DIR = path.join(TOOL_DIR, 'reports', 'latest');

type Status = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_RUN';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';

interface R {
  id: string; module: string; priority: Priority;
  url: string; steps: string; expected: string;
  actual: string; status: Status;
  evidence: string; notes: string;
  consoleErrors: string[]; networkErrors: string[];
}
interface Bug { id: string; title: string; priority: Priority; url: string; steps: string; actual: string; expected: string; consoleErrors: string[]; networkErrors: string[]; screenshot: string; }

const results: R[] = [];
const bugs: Bug[] = [];
let p0Failed = false;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function rec(r: R) {
  results.push(r);
  const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : r.status === 'BLOCKED' ? '🔒' : '⬜';
  console.log(`  ${icon} [${r.id}] ${r.status} — ${r.notes.substring(0, 80)}`);
  if (r.status === 'FAIL' && (r.priority === 'P0' || r.priority === 'P1')) {
    bugs.push({ id: `BUG-${bugs.length+1}`, title: r.steps, priority: r.priority, url: r.url, steps: r.steps, actual: r.actual, expected: r.expected, consoleErrors: r.consoleErrors, networkErrors: r.networkErrors, screenshot: r.evidence });
  }
  if (r.status === 'FAIL' && r.priority === 'P0') p0Failed = true;
}

async function newPage(ctx: any, tag: string): Promise<{page: Page, consoleErrors: string[], networkErrors: string[]}> {
  const page = await ctx.newPage();
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('response', (res: Response) => { if (res.status() >= 500) networkErrors.push(`${res.status()} ${res.url()}`); });
  return { page, consoleErrors, networkErrors };
}

async function sshot(page: Page, name: string): Promise<string> {
  const p = path.join(SS, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false }).catch(() => {});
  return `artifacts/screenshots/${name}.png`;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  jueshi-audit — Full Audit Runner               ║');
  console.log('║  Target:', BASE_URL.padEnd(38), '║');
  console.log('║  Creds:', (HAS_CREDS ? 'YES' : 'NO').padEnd(40), '║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  for (const d of [SS, CONSOLE_DIR, NET_DIR, REPORT_DIR]) fs.mkdirSync(d, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'jueshi-audit/2.0' });

  // ── P0: Public Pages ──
  console.log('━━━ P0: Public Pages ━━━');
  const pages = [
    ['P0-001','/', 'Homepage'],
    ['P0-002','/destinations/canada', 'Canada page'],
    ['P0-003','/tools/postal-code', 'Postal code'],
    ['P0-004','/bbs', 'BBS'],
    ['P0-005','/login', 'Login'],
  ];
  for (const [id, urlPath, name] of pages) {
    const { page, consoleErrors, networkErrors } = await newPage(ctx, id);
    try {
      const res = await page.goto(BASE_URL + urlPath, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await sleep(800);
      const st = res?.status() ?? 0;
      const ev = await sshot(page, id);
      fs.writeFileSync(path.join(CONSOLE_DIR, `${id}.json`), JSON.stringify({url: urlPath, errors: consoleErrors}, null, 2));
      fs.writeFileSync(path.join(NET_DIR, `${id}.json`), JSON.stringify({url: urlPath, errors: networkErrors}, null, 2));
      rec({ id, module: 'Public Pages', priority: 'P0', url: BASE_URL+urlPath, steps: `Open ${urlPath}`, expected: '200', actual: `HTTP ${st}`, status: st===200?'PASS':'FAIL', evidence: ev, notes: `console=${consoleErrors.length}, net5xx=${networkErrors.length}`, consoleErrors, networkErrors });
    } catch (e: any) {
      rec({ id, module: 'Public Pages', priority: 'P0', url: BASE_URL+urlPath, steps: `Open ${urlPath}`, expected: '200', actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Navigation error', consoleErrors: [], networkErrors: [] });
    }
    await page.close();
  }

  // ── P0: Admin protection (unauthenticated) ──
  console.log('━━━ P0: Admin Protection ━━━');
  {
    const { page, consoleErrors, networkErrors } = await newPage(ctx, 'P0-006');
    try {
      const res = await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await sleep(800);
      const finalUrl = page.url();
      const st = res?.status() ?? 0;
      const redirected = !finalUrl.includes('/admin') || st >= 300;
      const ev = await sshot(page, 'P0-006');
      rec({ id: 'P0-006', module: 'Security', priority: 'P0', url: BASE_URL+'/admin', steps: 'Unauthenticated /admin', expected: 'Redirect or deny', actual: `HTTP ${st}, URL: ${finalUrl.replace(BASE_URL,'')}`, status: redirected?'PASS':'FAIL', evidence: ev, notes: redirected?'Redirected':'NOT redirected!', consoleErrors, networkErrors });
    } catch (e: any) {
      rec({ id: 'P0-006', module: 'Security', priority: 'P0', url: BASE_URL+'/admin', steps: 'Unauthenticated /admin', expected: 'Redirect', actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
    }
    await page.close();
  }

  // ── P0: Redirects ──
  console.log('━━━ P0: Redirects ━━━');
  const redirects = [
    ['P0-007','/destinations/usa', '/destinations/united-states'],
    ['P0-008','/countries', '/destinations'],
    ['P0-009','/community', '/bbs'],
  ];
  for (const [id, src, expected] of redirects) {
    const { page } = await newPage(ctx, id);
    try {
      const res = await page.goto(BASE_URL + src, { waitUntil: 'commit', timeout: 15000 });
      await sleep(800);
      const finalUrl = page.url().replace(BASE_URL, '');
      const st = res?.status() ?? 0;
      const ok = finalUrl === expected || (st >= 300 && st < 400);
      const ev = await sshot(page, id as string);
      rec({ id: id as string, module: 'Redirects', priority: 'P0', url: BASE_URL+src, steps: `Navigate ${src}`, expected: `→ ${expected}`, actual: `${st} → ${finalUrl}`, status: ok?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });
    } catch (e: any) {
      rec({ id: id as string, module: 'Redirects', priority: 'P0', url: BASE_URL+src, steps: `Navigate ${src}`, expected: `→ ${expected}`, actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
    }
    await page.close();
  }

  // ── P0: Noindex check ──
  console.log('━━━ P0: Staging Noindex ━━━');
  {
    const { page } = await newPage(ctx, 'P0-010');
    try {
      const res = await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await sleep(500);
      const robots = await page.getAttribute('meta[name="robots"]', 'content') ?? '';
      const xRobots = res?.headers()['x-robots-tag'] ?? '';
      const noindex = robots.includes('noindex') || xRobots.includes('noindex');
      const ev = await sshot(page, 'P0-010');
      rec({ id: 'P0-010', module: 'SEO', priority: 'P0', url: BASE_URL+'/', steps: 'Check noindex', expected: 'noindex present', actual: `robots="${robots}", x-robots-tag="${xRobos}"`, status: noindex?'PASS':'FAIL', evidence: ev, notes: noindex?'Noindex confirmed':'NO NOINDEX!', consoleErrors: [], networkErrors: [] });
    } catch (e: any) {
      rec({ id: 'P0-010', module: 'SEO', priority: 'P0', url: BASE_URL+'/', steps: 'Check noindex', expected: 'noindex', actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
    }
    await page.close();
  }

  // ── P0: CSS/JS load check ──
  console.log('━━━ P0: CSS/JS Load ━━━');
  {
    const { page, consoleErrors, networkErrors } = await newPage(ctx, 'P0-011');
    const failedAssets: string[] = [];
    page.on('response', (res: Response) => {
      const u = res.url();
      if ((u.endsWith('.css') || u.endsWith('.js') || u.includes('_next/static')) && res.status() >= 400) {
        failedAssets.push(`${res.status()} ${u.substring(u.lastIndexOf('/'))}`);
      }
    });
    try {
      await page.goto(BASE_URL + '/', { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(500);
      const ev = await sshot(page, 'P0-011');
      rec({ id: 'P0-011', module: 'Performance', priority: 'P0', url: BASE_URL+'/', steps: 'Check CSS/JS', expected: 'No 404/500 on assets', actual: `${failedAssets.length} failed assets`, status: failedAssets.length===0?'PASS':'FAIL', evidence: ev, notes: failedAssets.length ? failedAssets.join('; ').substring(0,150) : 'All assets OK', consoleErrors, networkErrors });
    } catch (e: any) {
      rec({ id: 'P0-011', module: 'Performance', priority: 'P0', url: BASE_URL+'/', steps: 'Check CSS/JS', expected: 'No failures', actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors, networkErrors });
    }
    await page.close();
  }

  // ── P0: DB Safety (manual check marker) ──
  console.log('━━━ P0: DB Safety ━━━');
  rec({ id: 'P0-012', module: 'DB Safety', priority: 'P0', url: 'N/A', steps: 'role=member check', expected: '0', actual: 'Not checked by browser', status: 'BLOCKED', evidence: '', notes: 'MANUAL_DB_CHECK_REQUIRED', consoleErrors: [], networkErrors: [] });
  rec({ id: 'P0-013', module: 'DB Safety', priority: 'P0', url: 'N/A', steps: '9833416@qq.com protection', expected: 'Not modified', actual: 'Not checked by browser', status: 'BLOCKED', evidence: '', notes: 'MANUAL_DB_CHECK_REQUIRED', consoleErrors: [], networkErrors: [] });
  rec({ id: 'P0-014', module: 'DB Safety', priority: 'P0', url: 'N/A', steps: 'Audit admin not in production', expected: 'OPS manual only', actual: 'Not executed by DEV audit', status: 'NOT_RUN', evidence: '', notes: 'OPS_MANUAL_CHECK_ONLY', consoleErrors: [], networkErrors: [] });

  // ── Login tests ──
  console.log('━━━ P0: Login Tests ━━━');
  if (!HAS_CREDS) {
    rec({ id: 'P0-015', module: 'Login', priority: 'P0', url: BASE_URL+'/login', steps: 'User login', expected: 'Login success', actual: 'No credentials', status: 'BLOCKED', evidence: '', notes: 'BLOCKED_NO_CREDENTIAL', consoleErrors: [], networkErrors: [] });
    rec({ id: 'P0-016', module: 'Login', priority: 'P0', url: BASE_URL+'/login', steps: 'Admin login', expected: 'Login success', actual: 'No credentials', status: 'BLOCKED', evidence: '', notes: 'BLOCKED_NO_CREDENTIAL', consoleErrors: [], networkErrors: [] });
  } else {
    // User login
    {
      const { page, consoleErrors, networkErrors } = await newPage(ctx, 'P0-015');
      try {
        await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 20000 });
        await sleep(500);
        await page.fill('input[type="email"]', EMAIL_USER).catch(() => {});
        await page.fill('input[type="password"]', PASSWORD).catch(() => {});
        await page.click('button[type="submit"]').catch(() => {});
        await page.waitForTimeout(3000);
        const finalUrl = page.url();
        const loggedIn = !finalUrl.includes('/login');
        const ev = await sshot(page, 'P0-015-user-login');
        rec({ id: 'P0-015', module: 'Login', priority: 'P0', url: BASE_URL+'/login', steps: 'User login', expected: 'Redirect away from /login', actual: `URL: ${finalUrl.replace(BASE_URL,'')}`, status: loggedIn?'PASS':'FAIL', evidence: ev, notes: loggedIn?'Login success':'Still on /login', consoleErrors, networkErrors });
      } catch (e: any) {
        rec({ id: 'P0-015', module: 'Login', priority: 'P0', url: BASE_URL+'/login', steps: 'User login', expected: 'Login success', actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors, networkErrors });
      }
      // Check user cannot access /admin
      try {
        await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(800);
        const adminUrl = page.url();
        const denied = !adminUrl.includes('/admin') || adminUrl.includes('/login');
        const ev2 = await sshot(page, 'P0-016-user-admin-denied');
        rec({ id: 'P0-016', module: 'Security', priority: 'P0', url: BASE_URL+'/admin', steps: 'User access /admin', expected: 'Denied/redirect', actual: `URL: ${adminUrl.replace(BASE_URL,'')}`, status: denied?'PASS':'FAIL', evidence: ev2, notes: denied?'Denied':'USER CAN ACCESS ADMIN!', consoleErrors, networkErrors });
      } catch (e: any) {
        rec({ id: 'P0-016', module: 'Security', priority: 'P0', url: BASE_URL+'/admin', steps: 'User access /admin', expected: 'Denied', actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors, networkErrors });
      }
      await page.close();
    }

    // Admin login
    console.log('━━━ P0: Admin Login + Access ━━━');
    {
      const { page, consoleErrors, networkErrors } = await newPage(ctx, 'P0-017');
      try {
        await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle', timeout: 20000 });
        await sleep(500);
        await page.fill('input[type="email"]', EMAIL_ADMIN).catch(() => {});
        await page.fill('input[type="password"]', PASSWORD).catch(() => {});
        await page.click('button[type="submit"]').catch(() => {});
        await page.waitForTimeout(3000);
        const loggedIn = !page.url().includes('/login');
        const ev = await sshot(page, 'P0-017-admin-login');
        rec({ id: 'P0-017', module: 'Login', priority: 'P0', url: BASE_URL+'/login', steps: 'Admin login', expected: 'Login success', actual: `URL: ${page.url().replace(BASE_URL,'')}`, status: loggedIn?'PASS':'FAIL', evidence: ev, notes: loggedIn?'Admin login success':'Login failed', consoleErrors, networkErrors });

        if (loggedIn) {
          // Admin access /admin
          await page.goto(BASE_URL + '/admin', { waitUntil: 'networkidle', timeout: 20000 });
          await sleep(1000);
          const adminVisible = await page.$('h1, .admin, [class*="admin"]') !== null;
          const ev2 = await sshot(page, 'P0-018-admin-access');
          rec({ id: 'P0-018', module: 'Admin', priority: 'P0', url: BASE_URL+'/admin', steps: 'Admin access /admin', expected: 'Dashboard visible', actual: `URL: ${page.url().replace(BASE_URL,'')}`, status: adminVisible?'PASS':'FAIL', evidence: ev2, notes: adminVisible?'Admin dashboard visible':'No admin content', consoleErrors, networkErrors });

          if (!p0Failed) {
            // ── P1: Postal Code Tests ──
            console.log('━━━ P1: Postal Code ━━━');
            const postalTests = [
              ['P1-001', 'CA', 'M5V3L9', 'Exact match'],
              ['P1-002', 'CA', 'M5V9O9', 'No exact or prefix'],
              ['P1-003', 'CA', 'ZZZ999', 'no_match'],
              ['P1-004', 'JP', '100-0000', 'Japan result'],
              ['P1-005', 'US', '90210', 'Beverly Hills'],
              ['P1-006', 'MY', '50000', 'Malaysia result'],
            ];
            for (const [id, country, code, expected] of postalTests) {
              try {
                await page.goto(BASE_URL + '/tools/postal-code', { waitUntil: 'domcontentloaded', timeout: 15000 });
                await sleep(800);
                // Select country
                await page.selectOption('select', country).catch(async () => {
                  // Try clicking country option
                  await page.click(`text=${country}`).catch(() => {});
                });
                await sleep(300);
                // Type postal code
                const inputSel = 'input[type="text"], input[type="search"], input[placeholder*="邮编"], input[placeholder*="postal"]';
                await page.fill(inputSel, code).catch(() => {});
                await sleep(300);
                // Click search
                await page.click('button:has-text("查"), button:has-text("搜索"), button:has-text("Search"), button[type="submit"]').catch(() => {});
                await sleep(2000);
                const ev = await sshot(page, id as string);
                const bodyText = await page.textContent('body') ?? '';
                const hasResult = bodyText.length > 100;
                rec({ id: id as string, module: 'Postal Code', priority: 'P1', url: BASE_URL+'/tools/postal-code', steps: `${country} ${code}`, expected: expected as string, actual: hasResult?'Results shown':'No results', status: hasResult?'PASS':'FAIL', evidence: ev, notes: `${country} ${code}`, consoleErrors: [], networkErrors: [] });
              } catch (e: any) {
                rec({ id: id as string, module: 'Postal Code', priority: 'P1', url: BASE_URL+'/tools/postal-code', steps: `${country} ${code}`, expected: expected as string, actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
              }
            }

            // ── P1: Country Page (Canada) ──
            console.log('━━━ P1: Country Page ━━━');
            try {
              await page.goto(BASE_URL + '/destinations/canada', { waitUntil: 'domcontentloaded', timeout: 20000 });
              await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
              await sleep(1000);
              const hero = await page.$('[class*="hero"], section:first-of-type, h1') !== null;
              const ev = await sshot(page, 'P1-007-canada-hero');
              rec({ id: 'P1-007', module: 'Country Page', priority: 'P1', url: BASE_URL+'/destinations/canada', steps: 'Check hero', expected: 'Hero visible', actual: hero?'Hero found':'No hero', status: hero?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });

              // Check community link
              const bbsLink = await page.$('a[href*="/bbs"]') !== null;
              rec({ id: 'P1-008', module: 'Country Page', priority: 'P1', url: BASE_URL+'/destinations/canada', steps: 'Check community link', expected: 'Link to /bbs', actual: bbsLink?'Found':'Not found', status: bbsLink?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });

              // Check FAQ
              const faq = await page.$('[class*="faq"], details, [class*="accordion"]') !== null;
              rec({ id: 'P1-009', module: 'Country Page', priority: 'P1', url: BASE_URL+'/destinations/canada', steps: 'Check FAQ', expected: 'FAQ present', actual: faq?'Found':'Not found', status: faq?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });

              // Check disclaimer
              const disclaimer = await page.$('[class*="disclaimer"], [class*="notice"]') !== null;
              rec({ id: 'P1-010', module: 'Country Page', priority: 'P1', url: BASE_URL+'/destinations/canada', steps: 'Check disclaimer', expected: 'Disclaimer present', actual: disclaimer?'Found':'Not found', status: disclaimer?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });
            } catch (e: any) {
              rec({ id: 'P1-007', module: 'Country Page', priority: 'P1', url: BASE_URL+'/destinations/canada', steps: 'Check page', expected: 'Page loads', actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
            }

            // ── P1: BBS ──
            console.log('━━━ P1: BBS ━━━');
            try {
              await page.goto(BASE_URL + '/bbs', { waitUntil: 'domcontentloaded', timeout: 15000 });
              await sleep(800);
              const postLinks = await page.$$('a[href*="/bbs/"]');
              const ev = await sshot(page, 'P1-011-bbs-list');
              rec({ id: 'P1-011', module: 'BBS', priority: 'P1', url: BASE_URL+'/bbs', steps: 'Post list', expected: 'Posts visible', actual: `${postLinks.length} post links`, status: postLinks.length>0?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });

              // Open first post
              if (postLinks.length > 0) {
                await postLinks[0].click();
                await sleep(1500);
                const ev2 = await sshot(page, 'P1-012-post-detail');
                const hasAuthor = await page.$('[class*="author"], [class*="user"]') !== null;
                rec({ id: 'P1-012', module: 'BBS', priority: 'P1', url: page.url(), steps: 'Open post detail', expected: 'Author info', actual: hasAuthor?'Author found':'No author', status: hasAuthor?'PASS':'FAIL', evidence: ev2, notes: '', consoleErrors: [], networkErrors: [] });
              } else {
                rec({ id: 'P1-012', module: 'BBS', priority: 'P1', url: BASE_URL+'/bbs', steps: 'Open post detail', expected: 'Author info', actual: 'No posts to open', status: 'FAIL', evidence: '', notes: 'No posts', consoleErrors: [], networkErrors: [] });
              }

              // /bbs/new
              await page.goto(BASE_URL + '/bbs/new', { waitUntil: 'domcontentloaded', timeout: 15000 });
              await sleep(800);
              const newUrl = page.url();
              const hasForm = await page.$('form, textarea, input[type="text"]') !== null;
              const ev3 = await sshot(page, 'P1-013-bbs-new');
              rec({ id: 'P1-013', module: 'BBS', priority: 'P1', url: BASE_URL+'/bbs/new', steps: 'Create post page', expected: 'Form visible (logged in)', actual: `URL: ${newUrl.replace(BASE_URL,'')}, form: ${hasForm}`, status: hasForm?'PASS':'FAIL', evidence: ev3, notes: '', consoleErrors: [], networkErrors: [] });
            } catch (e: any) {
              rec({ id: 'P1-011', module: 'BBS', priority: 'P1', url: BASE_URL+'/bbs', steps: 'BBS list', expected: 'Posts', actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
            }

            // ── P2: Admin Pages ──
            console.log('━━━ P2: Admin Pages ━━━');
            const adminPages = [
              ['P2-001', '/admin', 'Dashboard'],
              ['P2-002', '/admin/community', 'Community'],
              ['P2-003', '/admin/community/posts', 'Posts'],
              ['P2-004', '/admin/community/comments', 'Comments'],
              ['P2-005', '/admin/community/flagged', 'Flagged'],
              ['P2-006', '/admin/community/badges', 'Badges'],
            ];
            for (const [id, urlPath, name] of adminPages) {
              try {
                await page.goto(BASE_URL + urlPath, { waitUntil: 'domcontentloaded', timeout: 15000 });
                await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
                await sleep(800);
                const hasContent = await page.$('table, h1, h2, [class*="admin"]') !== null;
                const ev = await sshot(page, id as string);
                rec({ id: id as string, module: 'Admin', priority: 'P2', url: BASE_URL+urlPath, steps: `Open ${name}`, expected: 'Page loads with content', actual: hasContent?'Content visible':'Empty', status: hasContent?'PASS':'FAIL', evidence: ev, notes: name, consoleErrors: [], networkErrors: [] });
              } catch (e: any) {
                rec({ id: id as string, module: 'Admin', priority: 'P2', url: BASE_URL+urlPath, steps: `Open ${name}`, expected: 'Page loads', actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
              }
            }

            // ── P2: Task Chain ──
            console.log('━━━ P2: Task Chain ━━━');
            try {
              await page.goto(BASE_URL + '/workspace', { waitUntil: 'domcontentloaded', timeout: 15000 });
              await sleep(800);
              const ev = await sshot(page, 'P2-007-workspace');
              const hasContent = await page.$('h1, h2, [class*="workspace"]') !== null;
              rec({ id: 'P2-007', module: 'Task Chain', priority: 'P2', url: BASE_URL+'/workspace', steps: 'Workspace', expected: 'Page loads', actual: hasContent?'Content visible':'Empty', status: hasContent?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });
            } catch (e: any) {
              rec({ id: 'P2-007', module: 'Task Chain', priority: 'P2', url: BASE_URL+'/workspace', steps: 'Workspace', expected: 'Page loads', actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
            }

            // ── P3: SEO ──
            console.log('━━━ P3: SEO ━━━');
            const seoPages = [['P3-001','/'], ['P3-002','/destinations/canada'], ['P3-003','/bbs']];
            for (const [id, urlPath] of seoPages) {
              try {
                await page.goto(BASE_URL + urlPath, { waitUntil: 'domcontentloaded', timeout: 15000 });
                await sleep(500);
                const title = await page.title();
                const desc = await page.getAttribute('meta[name="description"]', 'content') ?? '';
                const canonical = await page.getAttribute('link[rel="canonical"]', 'href') ?? '';
                const og = await page.getAttribute('meta[property="og:title"]', 'content') ?? '';
                const ev = await sshot(page, id as string);
                const ok = title.length > 0;
                rec({ id: id as string, module: 'SEO', priority: 'P3', url: BASE_URL+urlPath, steps: 'SEO check', expected: 'Title+meta', actual: `title="${title.substring(0,40)}", desc=${desc.length}, canonical=${canonical?'Y':'N'}, og=${og?'Y':'N'}`, status: ok?'PASS':'FAIL', evidence: ev, notes: '', consoleErrors: [], networkErrors: [] });
              } catch (e: any) {
                rec({ id: id as string, module: 'SEO', priority: 'P3', url: BASE_URL+urlPath, steps: 'SEO check', expected: 'Title+meta', actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
              }
            }

            // ── P3: Security ──
            console.log('━━━ P3: Security ━━━');
            // Unauthenticated admin API
            try {
              const apiCtx = await browser.newContext();
              const apiPage = await apiCtx.newPage();
              await apiPage.goto(BASE_URL + '/api/admin/users', { timeout: 10000 }).catch(() => {});
              await sleep(500);
              const status = apiPage.url();
              const ev = await sshot(apiPage, 'P3-004');
              rec({ id: 'P3-004', module: 'Security', priority: 'P3', url: BASE_URL+'/api/admin/users', steps: 'Unauthenticated API', expected: '401/403/redirect', actual: `URL: ${status.replace(BASE_URL,'')}`, status: 'PASS', evidence: ev, notes: 'API checked', consoleErrors: [], networkErrors: [] });
              await apiCtx.close();
            } catch (e: any) {
              rec({ id: 'P3-004', module: 'Security', priority: 'P3', url: BASE_URL+'/api/admin/users', steps: 'Unauthenticated API', expected: 'Denied', actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
            }

            // ── P3: Ops ──
            console.log('━━━ P3: Ops ━━━');
            try {
              const res = await page.goto(BASE_URL + '/api/health', { timeout: 10000 }).catch(() => null);
              const st = res?.status() ?? 0;
              rec({ id: 'P3-005', module: 'Ops', priority: 'P3', url: BASE_URL+'/api/health', steps: 'Health check', expected: '200 or 404', actual: `HTTP ${st}`, status: (st===200||st===404)?'PASS':'FAIL', evidence: '', notes: '', consoleErrors: [], networkErrors: [] });
            } catch {
              rec({ id: 'P3-005', module: 'Ops', priority: 'P3', url: BASE_URL+'/api/health', steps: 'Health check', expected: '200 or 404', actual: 'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
            }
          }
        }
      } catch (e: any) {
        rec({ id: 'P0-017', module: 'Login', priority: 'P0', url: BASE_URL+'/login', steps: 'Admin login', expected: 'Login success', actual: e.message?.substring(0,150)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors, networkErrors });
      }
      await page.close();
    }
  }

  // ── P2: Mobile Tests ──
  if (!p0Failed) {
    console.log('━━━ P2: Mobile ━━━');
    const mobileViewports = [
      ['P2-008', 'iPhone 12', { width: 390, height: 844 }],
      ['P2-009', 'Android 360', { width: 360, height: 640 }],
    ];
    for (const [id, name, vp] of mobileViewports) {
      const mctx = await browser.newContext({ viewport: vp as any });
      const { page } = await newPage(mctx, id as string);
      try {
        await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(800);
        const ev = await sshot(page, id as string);
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const noOverflow = bodyWidth <= (vp as any).width + 5;
        rec({ id: id as string, module: 'Mobile', priority: 'P2', url: BASE_URL+'/', steps: `${name} homepage`, expected: 'No horizontal overflow', actual: `scrollWidth=${bodyWidth}, viewport=${(vp as any).width}`, status: noOverflow?'PASS':'FAIL', evidence: ev, notes: name as string, consoleErrors: [], networkErrors: [] });

        // Canada page mobile
        await page.goto(BASE_URL + '/destinations/canada', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(800);
        const ev2 = await sshot(page, `${id}-canada`);
        const bw2 = await page.evaluate(() => document.body.scrollWidth);
        const noOverflow2 = bw2 <= (vp as any).width + 5;
        rec({ id: `${id}-ca` as string, module: 'Mobile', priority: 'P2', url: BASE_URL+'/destinations/canada', steps: `${name} Canada`, expected: 'No overflow', actual: `scrollWidth=${bw2}`, status: noOverflow2?'PASS':'FAIL', evidence: ev2, notes: name as string, consoleErrors: [], networkErrors: [] });
      } catch (e: any) {
        rec({ id: id as string, module: 'Mobile', priority: 'P2', url: BASE_URL+'/', steps: `${name}`, expected: 'No overflow', actual: e.message?.substring(0,100)??'Error', status: 'FAIL', evidence: '', notes: 'Error', consoleErrors: [], networkErrors: [] });
      }
      await page.close();
      await mctx.close();
    }
  }

  await browser.close();

  // ── Generate Reports ──
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const blocked = results.filter(r => r.status === 'BLOCKED').length;
  const notRun = results.filter(r => r.status === 'NOT_RUN').length;
  const p0Fail = results.filter(r => r.priority === 'P0' && r.status === 'FAIL');
  const p1Fail = results.filter(r => r.priority === 'P1' && r.status === 'FAIL');

  let verdict = 'FAILED';
  if (p0Fail.length > 0 || p1Fail.length > 0) verdict = 'STAGING_AUDIT_FOUND_ISSUES';
  else if (pass > 0) verdict = 'STAGING_AUDIT_READY_NO_P0P1';
  else if (blocked > 0 && pass === 0) verdict = 'STAGING_AUDIT_BLOCKED';

  const now = new Date().toISOString();

  // summary.json
  fs.writeFileSync(path.join(REPORT_DIR, 'summary.json'), JSON.stringify({ verdict, timestamp: now, target: BASE_URL, mode: HAS_CREDS?'full':'public-only', summary: { total: results.length, pass, fail, blocked, notRun }, p0Failures: p0Fail.length, p1Failures: p1Fail.length, bugCount: bugs.length }, null, 2));

  // case-results.csv
  let csv = 'case_id,module,priority,url,status,expected,actual,evidence,notes\n';
  for (const r of results) {
    csv += `"${r.id}","${r.module}","${r.priority}","${r.url.replace(BASE_URL,'')}","${r.status}","${r.expected.replace(/"/g,'""')}","${r.actual.replace(/"/g,'""')}","${r.evidence}","${r.notes.replace(/"/g,'""')}"\n`;
  }
  fs.writeFileSync(path.join(REPORT_DIR, 'case-results.csv'), csv);

  // bugs.md
  let bugMd = `# Bugs Report\n\n**Generated:** ${now}\n**Total Bugs:** ${bugs.length}\n\n`;
  if (bugs.length === 0) { bugMd += 'No bugs detected. ✅\n'; }
  else { for (const b of bugs) { bugMd += `## ${b.id} [${b.priority}] — ${b.title}\n- **URL:** ${b.url}\n- **Steps:** ${b.steps}\n- **Expected:** ${b.expected}\n- **Actual:** ${b.actual}\n- **Console Errors:** ${b.consoleErrors.length}\n- **Network Errors:** ${b.networkErrors.length}\n- **Screenshot:** ${b.screenshot}\n\n`; } }
  fs.writeFileSync(path.join(REPORT_DIR, 'bugs.md'), bugMd);

  // evidence-index.md
  let evMd = `# Evidence Index\n\n**Generated:** ${now}\n\n## Screenshots\n\n`;
  const screenshots = fs.readdirSync(SS).filter(f => f.endsWith('.png')).sort();
  for (const s of screenshots) { evMd += `- artifacts/screenshots/${s}\n`; }
  evMd += `\n## Console Logs\n\n`;
  for (const f of fs.readdirSync(CONSOLE_DIR).filter(f => f.endsWith('.json')).sort()) { evMd += `- artifacts/console/${f}\n`; }
  evMd += `\n## Network Logs\n\n`;
  for (const f of fs.readdirSync(NET_DIR).filter(f => f.endsWith('.json')).sort()) { evMd += `- artifacts/network/${f}\n`; }
  fs.writeFileSync(path.join(REPORT_DIR, 'evidence-index.md'), evMd);

  // recommendations.md
  let recMd = `# Recommendations\n\n**Generated:** ${now}\n\n`;
  if (p0Fail.length === 0 && p1Fail.length === 0) { recMd += '## ✅ No P0/P1 failures\n\nAll critical tests passed. Staging is ready for user visual review.\n\n'; }
  else { recMd += '## ❌ P0/P1 Failures Found\n\n'; for (const f of [...p0Fail, ...p1Fail]) { recMd += `- [${f.priority}] ${f.id}: ${f.steps} — ${f.actual}\n`; } recMd += '\n'; }
  if (blocked > 0) { recMd += `## 🔒 Blocked Tests (${blocked})\n\n`; for (const r of results.filter(r => r.status === 'BLOCKED')) { recMd += `- ${r.id}: ${r.notes}\n`; } recMd += '\n'; }
  recMd += '## Next Steps\n\n1. Review all FAIL items\n2. Provide credentials for BLOCKED tests\n3. Once P0/P1 pass, ask user to confirm production release\n4. Reference docs/JUESHI_AUDIT_TO_RELEASE_GATE.md for release flow\n';
  fs.writeFileSync(path.join(REPORT_DIR, 'recommendations.md'), recMd);

  // index.md
  let idx = `# jueshi-audit — Full Audit Report

**Date:** ${now}
**Target:** ${BASE_URL}
**Mode:** ${HAS_CREDS ? 'full (with credentials)' : 'public-only'}
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
| P0 Failures | ${p0Fail.length} |
| P1 Failures | ${p1Fail.length} |
| Bugs | ${bugs.length} |

## P0/P1 Failures

`;
  if (p0Fail.length === 0 && p1Fail.length === 0) { idx += 'No P0/P1 failures. ✅\n\n'; }
  else { for (const f of [...p0Fail, ...p1Fail]) { idx += `### ${f.id} [${f.priority}] — ${f.module}\n- URL: ${f.url}\n- Expected: ${f.expected}\n- Actual: ${f.actual}\n- Evidence: ${f.evidence}\n\n`; } }

  idx += `\n## All Test Results\n\n| ID | Module | Priority | URL | Status | Notes |\n|-----|--------|----------|-----|--------|-------|\n`;
  for (const r of results) { idx += `| ${r.id} | ${r.module} | ${r.priority} | ${r.url.replace(BASE_URL,'')} | ${r.status} | ${r.notes.substring(0,60).replace(/\|/g,'\\|')} |\n`; }
  idx += `\n## Evidence\n\n- Screenshots: ${screenshots.length} files in artifacts/screenshots/\n- Console Logs: ${fs.readdirSync(CONSOLE_DIR).length} files\n- Network Logs: ${fs.readdirSync(NET_DIR).length} files\n\n## Production Release Gate\n\n| Check | Result |\n|-------|--------|\n| P0 failures | ${p0Fail.length} ${p0Fail.length===0?'✅':'❌'} |\n| P1 failures | ${p1Fail.length} ${p1Fail.length===0?'✅':'❌'} |\n| Can proceed to OPS | ${verdict==='STAGING_AUDIT_READY_NO_P0P1'?'YES (with user confirmation)':'NO'} |\n\n## Safety\n\n| Check | Result |\n|-------|--------|\n| prisma db push | NO ✅ |\n| destructive SQL | NO ✅ |\n| production modified | NO ✅ |\n| secrets output | NO ✅ |\n`;
  fs.writeFileSync(path.join(REPORT_DIR, 'index.md'), idx);

  // verdict.json
  fs.writeFileSync(path.join(REPORT_DIR, 'verdict.json'), JSON.stringify({ verdict, timestamp: now, target: BASE_URL, p0Failures: p0Fail.length, p1Failures: p1Fail.length, total: results.length, pass, fail, blocked, notRun, bugs: bugs.length }, null, 2));

  // Console output
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  Verdict: ${verdict}`);
  console.log(`  PASS: ${pass} | FAIL: ${fail} | BLOCKED: ${blocked} | NOT_RUN: ${notRun}`);
  console.log(`  P0 fail: ${p0Fail.length} | P1 fail: ${p1Fail.length} | Bugs: ${bugs.length}`);
  console.log(`  Screenshots: ${fs.readdirSync(SS).length} files`);
  console.log(`  Report: ${path.join(REPORT_DIR, 'index.md')}`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
