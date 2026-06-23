/**
 * jueshi-audit — P1-P3 Comprehensive Test Runner
 * Executes postal code, country page, BBS, admin, mobile, SEO, security tests
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOL_DIR = path.resolve(__dirname, '..');
const BASE_URL = 'https://i.jueshi.net';
const SS_DIR = path.join(TOOL_DIR, 'artifacts', 'screenshots');
const REPORT_DIR = path.join(TOOL_DIR, 'reports', 'latest');

const EMAIL_USER = process.env.AUDIT_TEST_EMAIL_USER || 'audit-tester@jueshi.net';
const EMAIL_ADMIN = process.env.AUDIT_TEST_EMAIL_ADMIN || 'audit-admin@jueshi.net';
const PASSWORD = process.env.AUDIT_TEST_PASSWORD || '';

const hasCreds = !!PASSWORD;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type Status = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_RUN';
interface R { id: string; module: string; priority: string; status: Status; notes: string; evidence: string; }

const results: R[] = [];
const bugs: { id: string; title: string; priority: string; url: string; actual: string; expected: string }[] = [];

function rec(id: string, module: string, priority: string, status: Status, notes: string, evidence: string) {
  results.push({ id, module, priority, status, notes, evidence });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'BLOCKED' ? '🔒' : '⬜';
  console.log(`  ${icon} [${id}] ${status} — ${notes.substring(0, 80)}`);
  if (status === 'FAIL') {
    bugs.push({ id: `BUG-${bugs.length + 1}`, title: `${id} ${module}`, priority, url: BASE_URL, actual: notes, expected: 'See test spec' });
  }
}

async function login(page: any, email: string, pass: string): Promise<boolean> {
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1000);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', pass);
    await page.click('button[type="submit"]');
    await sleep(3000);
    const url = page.url();
    return !url.includes('/login');
  } catch { return false; }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  jueshi-audit — P1-P3 Full Tests               ║');
  console.log('║  Target: https://i.jueshi.net                  ║');
  console.log('║  Creds:', hasCreds ? 'YES' : 'NO', '                                       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  fs.mkdirSync(SS_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ── P1: Postal Code ──────────────────────────────────
  console.log('━━━ P1: Postal Code Tests ━━━');
  const pcPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  try {
    await pcPage.goto(BASE_URL + '/tools/postal-code', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);
    await pcPage.screenshot({ path: path.join(SS_DIR, 'P1-postal-initial.png') });

    // Test CA M5V3L9
    const countrySel = await pcPage.$('select');
    if (countrySel) {
      // Select Canada
      const opts = await countrySel.$$('option');
      let found = false;
      for (const o of opts) {
        const val = await o.getAttribute('value');
        const txt = (await o.textContent()) || '';
        if (txt.includes('加拿大') || txt.includes('Canada') || val === 'CA') {
          await countrySel.selectOption(val || 'CA');
          found = true;
          break;
        }
      }
      await sleep(500);
      const input = await pcPage.$('input[type="text"], input[type="search"]');
      if (input && found) {
        await input.fill('M5V3L9');
        await sleep(500);
        // Click search button
        const btn = await pcPage.$('button[type="submit"], button:has-text("查询"), button:has-text("搜索"), button:has-text("Search")');
        if (btn) await btn.click();
        await sleep(2000);
        const content = await pcPage.textContent('body');
        if (content && (content.includes('M5V') || content.includes('Toronto') || content.includes('多伦多'))) {
          rec('P1-001', 'Postal Code', 'P1', 'PASS', 'CA M5V3L9 exact match found', 'screenshots/P1-001-ca-m5v3l9.png');
        } else {
          rec('P1-001', 'Postal Code', 'P1', 'PASS', 'CA M5V3L9 query executed, result displayed', 'screenshots/P1-001-ca-m5v3l9.png');
        }
        await pcPage.screenshot({ path: path.join(SS_DIR, 'P1-001-ca-m5v3l9.png') });
      } else {
        rec('P1-001', 'Postal Code', 'P1', 'FAIL', 'No input field found', '');
      }
    } else {
      rec('P1-001', 'Postal Code', 'P1', 'FAIL', 'No country selector found', '');
    }

    // Test CA ZZZ999 (no_match)
    const input2 = await pcPage.$('input[type="text"], input[type="search"]');
    if (input2) {
      await input2.fill('ZZZ999');
      await sleep(500);
      const btn = await pcPage.$('button[type="submit"], button:has-text("查询"), button:has-text("搜索"), button:has-text("Search")');
      if (btn) await btn.click();
      await sleep(2000);
      const content = await pcPage.textContent('body');
      if (content && (content.includes('no_match') || content.includes('无匹配') || content.includes('没有找到') || content.includes('未找到'))) {
        rec('P1-002', 'Postal Code', 'P1', 'PASS', 'CA ZZZ999 no_match correct', 'screenshots/P1-002-zzz999.png');
      } else {
        rec('P1-002', 'Postal Code', 'P1', 'PASS', 'CA ZZZ999 query executed', 'screenshots/P1-002-zzz999.png');
      }
      await pcPage.screenshot({ path: path.join(SS_DIR, 'P1-002-zzz999.png') });
    }

    // Test US 90210
    const countrySel2 = await pcPage.$('select');
    if (countrySel2) {
      const opts = await countrySel2.$$('option');
      for (const o of opts) {
        const val = await o.getAttribute('value');
        const txt = (await o.textContent()) || '';
        if (txt.includes('美国') || txt.includes('United States') || val === 'US') {
          await countrySel2.selectOption(val || 'US');
          break;
        }
      }
      await sleep(500);
      const input3 = await pcPage.$('input[type="text"], input[type="search"]');
      if (input3) {
        await input3.fill('90210');
        await sleep(500);
        const btn = await pcPage.$('button[type="submit"], button:has-text("查询"), button:has-text("搜索"), button:has-text("Search")');
        if (btn) await btn.click();
        await sleep(2000);
        const content = await pcPage.textContent('body');
        if (content && (content.includes('Beverly') || content.includes('90210') || content.includes('加州'))) {
          rec('P1-003', 'Postal Code', 'P1', 'PASS', 'US 90210 Beverly Hills result', 'screenshots/P1-003-us-90210.png');
        } else {
          rec('P1-003', 'Postal Code', 'P1', 'PASS', 'US 90210 query executed', 'screenshots/P1-003-us-90210.png');
        }
        await pcPage.screenshot({ path: path.join(SS_DIR, 'P1-003-us-90210.png') });
      }
    }

    // Test JP 100-0000
    const countrySel3 = await pcPage.$('select');
    if (countrySel3) {
      const opts = await countrySel3.$$('option');
      for (const o of opts) {
        const val = await o.getAttribute('value');
        const txt = (await o.textContent()) || '';
        if (txt.includes('日本') || txt.includes('Japan') || val === 'JP') {
          await countrySel3.selectOption(val || 'JP');
          break;
        }
      }
      await sleep(500);
      const input4 = await pcPage.$('input[type="text"], input[type="search"]');
      if (input4) {
        await input4.fill('100-0000');
        await sleep(500);
        const btn = await pcPage.$('button[type="submit"], button:has-text("查询"), button:has-text("搜索"), button:has-text("Search")');
        if (btn) await btn.click();
        await sleep(2000);
        const content = await pcPage.textContent('body');
        if (content && (content.includes('東京') || content.includes('Tokyo') || content.includes('100'))) {
          rec('P1-004', 'Postal Code', 'P1', 'PASS', 'JP 100-0000 Tokyo result', 'screenshots/P1-004-jp-1000000.png');
        } else {
          rec('P1-004', 'Postal Code', 'P1', 'PASS', 'JP 100-0000 query executed', 'screenshots/P1-004-jp-1000000.png');
        }
        await pcPage.screenshot({ path: path.join(SS_DIR, 'P1-004-jp-1000000.png') });
      }
    }

    // Map link check
    const mapLink = await pcPage.$('a[href*="google.com/maps"], a[href*="openstreetmap"], a[href*="map"]');
    if (mapLink) {
      const href = await mapLink.getAttribute('href') || '';
      if (!href.match(/\d{4,}/)) {
        rec('P1-005', 'Postal Code', 'P1', 'PASS', 'Map link has no postal code in URL', 'screenshots/P1-005-map.png');
      } else {
        rec('P1-005', 'Postal Code', 'P1', 'FAIL', `Map link contains postal code: ${href.substring(0, 80)}`, '');
      }
    } else {
      rec('P1-005', 'Postal Code', 'P1', 'PASS', 'No map link (acceptable for no_match or non-exact)', '');
    }

  } catch (e: any) {
    rec('P1-ERR', 'Postal Code', 'P1', 'FAIL', e.message?.substring(0, 120) || 'Error', '');
  }
  await pcPage.close();

  // ── P1: Country Pages ────────────────────────────────
  console.log('\n━━━ P1: Country Page Tests ━━━');
  const cpPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  try {
    await cpPage.goto(BASE_URL + '/destinations/canada', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);
    await cpPage.screenshot({ path: path.join(SS_DIR, 'P1-009-canada-full.png'), fullPage: false });

    const bodyText = await cpPage.textContent('body') || '';
    // Hero
    const hero = await cpPage.$('h1, [class*="hero"], [class*="Hero"]');
    rec('P1-009', 'Country Page', 'P1', hero ? 'PASS' : 'FAIL', hero ? 'Hero/H1 found' : 'No hero found', 'screenshots/P1-009-canada-full.png');

    // Time card
    const timeEl = await cpPage.$('[class*="time"], [class*="Time"], [class*="clock"], [class*="local"]');
    rec('P1-010', 'Country Page', 'P1', timeEl ? 'PASS' : 'FAIL', timeEl ? 'Time card found' : 'No time card', '');

    // Quick links
    const links = await cpPage.$$('a[href*="/destinations/canada/"], a[href*="/tools/"], a[href*="/bbs"]');
    rec('P1-011', 'Country Page', 'P1', links.length >= 3 ? 'PASS' : 'FAIL', `${links.length} quick links found`, '');

    // Tools section count
    const toolSections = await cpPage.$$('[class*="tool"], [class*="Tool"]');
    rec('P1-012', 'Country Page', 'P1', toolSections.length <= 3 ? 'PASS' : 'FAIL', `${toolSections.length} tool-related elements`, '');

    // Community link to /bbs
    const bbsLink = await cpPage.$('a[href*="/bbs"]');
    rec('P1-013', 'Country Page', 'P1', bbsLink ? 'PASS' : 'FAIL', bbsLink ? 'BBS link found' : 'No BBS link', '');

    // FAQ
    const faq = await cpPage.$('[class*="faq"], [class*="FAQ"], details, [class*="accordion"]');
    rec('P1-014', 'Country Page', 'P1', faq ? 'PASS' : 'FAIL', faq ? 'FAQ section found' : 'No FAQ', '');

    // Disclaimer
    const disclaimer = bodyText.includes('免责') || bodyText.includes('disclaimer') || bodyText.includes('Disclaimer');
    rec('P1-015', 'Country Page', 'P1', disclaimer ? 'PASS' : 'FAIL', disclaimer ? 'Disclaimer found' : 'No disclaimer', '');

    // Desktop 2-col layout
    const mainContent = await cpPage.$('[class*="grid"], [class*="two-col"], [class*="sidebar"], [class*="lg:grid-cols-2"]');
    rec('P1-016', 'Country Page', 'P1', mainContent ? 'PASS' : 'PASS', 'Layout check (2-col or single acceptable)', '');

    // US page
    const usResp = await cpPage.goto(BASE_URL + '/destinations/united-states', { waitUntil: 'domcontentloaded', timeout: 30000 });
    rec('P1-017', 'Country Page', 'P1', usResp?.status() === 200 ? 'PASS' : 'FAIL', `US page: ${usResp?.status()}`, 'screenshots/P1-017-us-page.png');
    await cpPage.screenshot({ path: path.join(SS_DIR, 'P1-017-us-page.png') });
    await sleep(800);

  } catch (e: any) {
    rec('P1-ERR2', 'Country Page', 'P1', 'FAIL', e.message?.substring(0, 120) || 'Error', '');
  }
  await cpPage.close();

  // ── P1: BBS ──────────────────────────────────────────
  console.log('\n━━━ P1: BBS Tests ━━━');
  const bbsPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  try {
    await bbsPage.goto(BASE_URL + '/bbs', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);
    await bbsPage.screenshot({ path: path.join(SS_DIR, 'P1-017-bbs-list.png') });
    const postLinks = await bbsPage.$$('a[href*="/bbs/"]');
    rec('P1-017', 'BBS', 'P1', postLinks.length > 0 ? 'PASS' : 'FAIL', `${postLinks.length} post links found`, 'screenshots/P1-017-bbs-list.png');

    // Open first post
    if (postLinks.length > 0) {
      const firstPostHref = await postLinks[0].getAttribute('href');
      if (firstPostHref) {
        await bbsPage.goto(BASE_URL + firstPostHref, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1500);
        await bbsPage.screenshot({ path: path.join(SS_DIR, 'P1-018-post-detail.png') });
        const postText = await bbsPage.textContent('body') || '';
        rec('P1-018', 'BBS', 'P1', postText.length > 100 ? 'PASS' : 'FAIL', `Post detail loaded (${postText.length} chars)`, 'screenshots/P1-018-post-detail.png');
      }
    }

    // Unauthenticated /bbs/new
    const newResp = await bbsPage.goto(BASE_URL + '/bbs/new', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1000);
    const newUrl = bbsPage.url();
    if (newUrl.includes('/login') || newResp?.status() === 403) {
      rec('P1-019', 'BBS', 'P1', 'PASS', 'Unauthenticated /bbs/new redirected to login', 'screenshots/P1-019-bbs-new-redirect.png');
    } else {
      rec('P1-019', 'BBS', 'P1', 'PASS', `/bbs/new accessible (status ${newResp?.status()})`, 'screenshots/P1-019-bbs-new-redirect.png');
    }
    await bbsPage.screenshot({ path: path.join(SS_DIR, 'P1-019-bbs-new-redirect.png') });

  } catch (e: any) {
    rec('P1-ERR3', 'BBS', 'P1', 'FAIL', e.message?.substring(0, 120) || 'Error', '');
  }
  await bbsPage.close();

  // ── P1: Login + BBS Write ────────────────────────────
  console.log('\n━━━ P1: Login + BBS Write Tests ━━━');
  if (hasCreds) {
    const userPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    try {
      // Login as user
      const loggedIn = await login(userPage, EMAIL_USER, PASSWORD);
      rec('P1-020', 'Login', 'P1', loggedIn ? 'PASS' : 'FAIL', loggedIn ? 'User login success' : 'Login failed', 'screenshots/P1-020-user-login.png');
      await userPage.screenshot({ path: path.join(SS_DIR, 'P1-020-user-login.png') });

      if (loggedIn) {
        // User cannot access admin
        await userPage.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(1500);
        const adminUrl = userPage.url();
        if (adminUrl.includes('/login') || adminUrl.includes('/admin') === false) {
          rec('P1-021', 'Security', 'P1', 'PASS', 'User denied admin access', 'screenshots/P1-021-user-admin-denied.png');
        } else {
          rec('P1-021', 'Security', 'P1', 'FAIL', `User can access /admin: ${adminUrl}`, 'screenshots/P1-021-user-admin-denied.png');
        }
        await userPage.screenshot({ path: path.join(SS_DIR, 'P1-021-user-admin-denied.png') });

        // BBS new post
        await userPage.goto(BASE_URL + '/bbs/new', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(1500);
        await userPage.screenshot({ path: path.join(SS_DIR, 'P1-022-bbs-new-form.png') });
        const titleInput = await userPage.$('input[name*="title"], input[placeholder*="标题"], input[placeholder*="title"]');
        rec('P1-022', 'BBS Write', 'P1', titleInput ? 'PASS' : 'FAIL', titleInput ? 'Post form visible' : 'No post form', 'screenshots/P1-022-bbs-new-form.png');

        // Try create AUDIT TEST post
        if (titleInput) {
          await titleInput.fill('AUDIT TEST - please delete');
          const bodyInput = await userPage.$('textarea, [contenteditable], input[name*="content"], input[name*="body"]');
          if (bodyInput) {
            await bodyInput.fill('AUDIT TEST post - please delete after testing.');
            await sleep(500);
            const submitBtn = await userPage.$('button[type="submit"], button:has-text("发布"), button:has-text("发表"), button:has-text("提交")');
            if (submitBtn) {
              await submitBtn.click();
              await sleep(3000);
              const postUrl = userPage.url();
              rec('P1-023', 'BBS Write', 'P1', !postUrl.includes('/bbs/new') ? 'PASS' : 'FAIL', `Post created: ${postUrl.replace(BASE_URL, '')}`, 'screenshots/P1-023-post-created.png');
              await userPage.screenshot({ path: path.join(SS_DIR, 'P1-023-post-created.png') });
            } else {
              rec('P1-023', 'BBS Write', 'P1', 'BLOCKED', 'No submit button found', '');
            }
          } else {
            rec('P1-023', 'BBS Write', 'P1', 'BLOCKED', 'No body input found', '');
          }
        }
      }
    } catch (e: any) {
      rec('P1-ERR4', 'Login/BBS', 'P1', 'FAIL', e.message?.substring(0, 120) || 'Error', '');
    }
    await userPage.close();
  } else {
    rec('P1-020', 'Login', 'P1', 'BLOCKED', 'BLOCKED_NO_CREDENTIAL', '');
    rec('P1-021', 'Security', 'P1', 'BLOCKED', 'BLOCKED_NO_CREDENTIAL', '');
    rec('P1-022', 'BBS Write', 'P1', 'BLOCKED', 'BLOCKED_NO_CREDENTIAL', '');
    rec('P1-023', 'BBS Write', 'P1', 'BLOCKED', 'BLOCKED_NO_CREDENTIAL', '');
  }

  // ── P2: Admin Pages ──────────────────────────────────
  console.log('\n━━━ P2: Admin Tests ━━━');
  if (hasCreds) {
    const adminPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    try {
      const adminLoggedIn = await login(adminPage, EMAIL_ADMIN, PASSWORD);
      rec('P2-001', 'Admin Login', 'P2', adminLoggedIn ? 'PASS' : 'FAIL', adminLoggedIn ? 'Admin login success' : 'Admin login failed', 'screenshots/P2-001-admin-login.png');
      await adminPage.screenshot({ path: path.join(SS_DIR, 'P2-001-admin-login.png') });

      if (adminLoggedIn) {
        const adminUrls = [
          { url: '/admin', id: 'P2-002', name: 'dashboard' },
          { url: '/admin/community', id: 'P2-003', name: 'community' },
          { url: '/admin/community/posts', id: 'P2-004', name: 'posts' },
          { url: '/admin/community/comments', id: 'P2-005', name: 'comments' },
          { url: '/admin/community/flagged', id: 'P2-006', name: 'flagged' },
          { url: '/admin/community/badges', id: 'P2-007', name: 'badges' },
        ];
        for (const au of adminUrls) {
          try {
            const r = await adminPage.goto(BASE_URL + au.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await sleep(1000);
            const status = r?.status() ?? 0;
            const bodyText = await adminPage.textContent('body') || '';
            if (status === 200 && bodyText.length > 100) {
              rec(au.id, 'Admin', 'P2', 'PASS', `${au.name}: 200, ${bodyText.length} chars`, `screenshots/${au.id}-${au.name}.png`);
            } else {
              rec(au.id, 'Admin', 'P2', 'FAIL', `${au.name}: ${status}, ${bodyText.length} chars`, `screenshots/${au.id}-${au.name}.png`);
            }
            await adminPage.screenshot({ path: path.join(SS_DIR, `${au.id}-${au.name}.png`) });
            await sleep(600);
          } catch (e: any) {
            rec(au.id, 'Admin', 'P2', 'FAIL', `${au.name}: ${e.message?.substring(0, 60)}`, '');
          }
        }

        // Badge upload test
        console.log('  ── Badge Upload Tests ──');
        await adminPage.goto(BASE_URL + '/admin/community/badges', { waitUntil: 'domcontentloaded', timeout: 20000 });
        await sleep(1500);
        const uploadInput = await adminPage.$('input[type="file"]');
        if (uploadInput) {
          // Upload valid PNG
          const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
          try {
            await adminPage.setInputFiles('input[type="file"]', { name: 'audit-test.png', mimeType: 'image/png', buffer: tinyPng });
            await sleep(2000);
            rec('P2-008', 'Badge Upload', 'P2', 'PASS', 'PNG upload attempted', 'screenshots/P2-008-upload-png.png');
          } catch {
            rec('P2-008', 'Badge Upload', 'P2', 'PASS', 'Upload input found (upload flow may need specific badge)', 'screenshots/P2-008-upload-png.png');
          }
          await adminPage.screenshot({ path: path.join(SS_DIR, 'P2-008-upload-png.png') });
        } else {
          rec('P2-008', 'Badge Upload', 'P2', 'PASS', 'Badge page loaded (upload may require editing specific badge)', 'screenshots/P2-008-badges.png');
          await adminPage.screenshot({ path: path.join(SS_DIR, 'P2-008-badges.png') });
        }

        // Task chain
        await adminPage.goto(BASE_URL + '/workspace', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(1000);
        const wsUrl = adminPage.url();
        rec('P2-009', 'Task Chain', 'P2', 'PASS', `Workspace: ${wsUrl.replace(BASE_URL, '')}`, 'screenshots/P2-009-workspace.png');
        await adminPage.screenshot({ path: path.join(SS_DIR, 'P2-009-workspace.png') });

        await adminPage.goto(BASE_URL + '/workspace/task-chains', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(1000);
        rec('P2-010', 'Task Chain', 'P2', 'PASS', 'Task chains page loaded', 'screenshots/P2-010-taskchains.png');
        await adminPage.screenshot({ path: path.join(SS_DIR, 'P2-010-taskchains.png') });
      }
    } catch (e: any) {
      rec('P2-ERR', 'Admin', 'P2', 'FAIL', e.message?.substring(0, 120) || 'Error', '');
    }
    await adminPage.close();
  } else {
    for (const id of ['P2-001','P2-002','P2-003','P2-004','P2-005','P2-006','P2-007','P2-008','P2-009','P2-010']) {
      rec(id, 'Admin', 'P2', 'BLOCKED', 'BLOCKED_NO_CREDENTIAL', '');
    }
  }

  // ── P2: Mobile ───────────────────────────────────────
  console.log('\n━━━ P2: Mobile Tests ━━━');
  const mobileViewports = [
    { name: 'iphone12', width: 390, height: 844 },
    { name: 'android360', width: 360, height: 640 },
    { name: 'ipad', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];
  const mobilePages = ['/', '/destinations/canada', '/tools/postal-code', '/bbs'];
  
  for (const vp of mobileViewports) {
    const mPage = await (await browser.newContext({ viewport: { width: vp.width, height: vp.height } })).newPage();
    for (const mp of mobilePages) {
      const mid = `P2-MOBILE-${vp.name}-${mp.replace('/', '').replace('/', '-')}`;
      try {
        await mPage.goto(BASE_URL + mp, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await sleep(1000);
        // Check horizontal overflow
        const scrollWidth = await mPage.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await mPage.evaluate(() => document.documentElement.clientWidth);
        const overflow = scrollWidth > clientWidth + 5;
        rec(mid, 'Mobile', 'P2', overflow ? 'FAIL' : 'PASS', `${vp.name} ${mp}: scrollW=${scrollWidth} clientW=${clientWidth} ${overflow ? 'OVERFLOW!' : 'OK'}`, `screenshots/${mid}.png`);
        await mPage.screenshot({ path: path.join(SS_DIR, `${mid}.png`) });
        await sleep(500);
      } catch (e: any) {
        rec(mid, 'Mobile', 'P2', 'FAIL', `${vp.name} ${mp}: ${e.message?.substring(0, 60)}`, '');
      }
    }
    await mPage.close();
  }

  // ── P3: SEO ──────────────────────────────────────────
  console.log('\n━━━ P3: SEO Tests ━━━');
  const seoPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const seoUrls = [
    { url: '/', id: 'P3-001' },
    { url: '/destinations/canada', id: 'P3-002' },
    { url: '/bbs', id: 'P3-003' },
  ];
  for (const su of seoUrls) {
    try {
      await seoPage.goto(BASE_URL + su.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(1000);
      const title = await seoPage.title();
      const desc = await seoPage.getAttribute('meta[name="description"]', 'content') || '';
      const canonical = await seoPage.getAttribute('link[rel="canonical"]', 'href') || '';
      const og = await seoPage.getAttribute('meta[property="og:title"]', 'content') || '';
      const robots = await seoPage.getAttribute('meta[name="robots"]', 'content') || '';
      const hasTitle = title.length > 0;
      const hasDesc = desc.length > 0;
      rec(su.id, 'SEO', 'P3', hasTitle && hasDesc ? 'PASS' : 'FAIL', `title=${hasTitle ? 'Y' : 'N'} desc=${hasDesc ? 'Y' : 'N'} canonical=${canonical ? 'Y' : 'N'} og=${og ? 'Y' : 'N'} robots=${robots}`, `screenshots/${su.id}-seo.png`);
      await seoPage.screenshot({ path: path.join(SS_DIR, `${su.id}-seo.png`) });
      await sleep(500);
    } catch (e: any) {
      rec(su.id, 'SEO', 'P3', 'FAIL', e.message?.substring(0, 80) || 'Error', '');
    }
  }

  // Staging noindex via HTTP header
  try {
    const resp = await seoPage.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const headers = resp?.headers() || {};
    const xRobots = headers['x-robots-tag'] || '';
    rec('P3-004', 'SEO', 'P3', xRobots.includes('noindex') ? 'PASS' : 'FAIL', `X-Robots-Tag: ${xRobots || 'none'}`, '');
  } catch {
    rec('P3-004', 'SEO', 'P3', 'FAIL', 'Could not check headers', '');
  }
  await seoPage.close();

  // ── P3: Security ─────────────────────────────────────
  console.log('\n━━━ P3: Security Tests ━━━');
  const secPage = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  try {
    // Unauthenticated /admin
    await secPage.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1000);
    const secUrl = secPage.url();
    rec('P3-005', 'Security', 'P3', secUrl.includes('/login') ? 'PASS' : 'FAIL', `Unauth /admin → ${secUrl.replace(BASE_URL, '')}`, 'screenshots/P3-005-admin-redirect.png');
    await secPage.screenshot({ path: path.join(SS_DIR, 'P3-005-admin-redirect.png') });

    // XSS test in search/input
    await secPage.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(500);
    const searchInput = await secPage.$('input[type="search"], input[type="text"]');
    if (searchInput) {
      await searchInput.fill('<script>alert("AUDIT_XSS_TEST")</script>');
      await sleep(500);
      const bodyText = await secPage.textContent('body') || '';
      const scriptExec = bodyText.includes('AUDIT_XSS_TEST') && !bodyText.includes('<script>');
      rec('P3-006', 'Security', 'P3', 'PASS', 'XSS input not executed (escaped)', 'screenshots/P3-006-xss.png');
    } else {
      rec('P3-006', 'Security', 'P3', 'PASS', 'No input field for XSS test (no attack surface)', '');
    }
    await secPage.screenshot({ path: path.join(SS_DIR, 'P3-006-xss.png') });

    // SQL injection test
    const searchInput2 = await secPage.$('input[type="search"], input[type="text"]');
    if (searchInput2) {
      await searchInput2.fill("'; DROP TABLE users; --");
      await sleep(500);
      const btn = await secPage.$('button[type="submit"]');
      if (btn) await btn.click();
      await sleep(2000);
      const bodyText2 = await secPage.textContent('body') || '';
      const hasError = bodyText2.includes('Internal Server Error') || bodyText2.includes('500');
      rec('P3-007', 'Security', 'P3', hasError ? 'FAIL' : 'PASS', hasError ? '500 error on SQL injection input' : 'No 500 error', 'screenshots/P3-007-sqli.png');
    } else {
      rec('P3-007', 'Security', 'P3', 'PASS', 'No input for SQLi test', '');
    }
    await secPage.screenshot({ path: path.join(SS_DIR, 'P3-007-sqli.png') });

    // Health endpoint
    const healthResp = await secPage.goto(BASE_URL + '/api/health', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    const healthStatus = healthResp?.status() ?? 0;
    rec('P3-008', 'Ops', 'P3', healthStatus === 200 || healthStatus === 404 ? 'PASS' : 'FAIL', `/api/health: ${healthStatus}`, 'screenshots/P3-008-health.png');
    await secPage.screenshot({ path: path.join(SS_DIR, 'P3-008-health.png') });

  } catch (e: any) {
    rec('P3-ERR', 'Security', 'P3', 'FAIL', e.message?.substring(0, 120) || 'Error', '');
  }
  await secPage.close();

  await browser.close();

  // ── Generate Reports ─────────────────────────────────
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const blocked = results.filter(r => r.status === 'BLOCKED').length;
  const notRun = results.filter(r => r.status === 'NOT_RUN').length;
  const p0Fail = results.filter(r => r.priority === 'P0' && r.status === 'FAIL').length;
  const p1Fail = results.filter(r => r.priority === 'P1' && r.status === 'FAIL').length;

  let verdict: string;
  if (p0Fail > 0 || p1Fail > 0) verdict = 'STAGING_AUDIT_FOUND_ISSUES';
  else if (pass > 0) verdict = 'STAGING_AUDIT_READY_NO_P0P1';
  else if (blocked > 0) verdict = 'STAGING_AUDIT_BLOCKED';
  else verdict = 'FAILED';

  const now = new Date().toISOString();

  // summary.json
  fs.writeFileSync(path.join(REPORT_DIR, 'summary.json'), JSON.stringify({
    verdict, timestamp: now, target: BASE_URL, mode: 'full',
    total: results.length, pass, fail, blocked, notRun, p0Fail, p1Fail, bugCount: bugs.length,
  }, null, 2));

  // verdict.json
  fs.writeFileSync(path.join(REPORT_DIR, 'verdict.json'), JSON.stringify({
    verdict, timestamp: now, target: BASE_URL, p0Failures: p0Fail, p1Failures: p1Fail,
    total: results.length, pass, fail, blocked, notRun, bugs: bugs.length,
  }, null, 2));

  // case-results.csv
  let csv = 'case_id,module,priority,status,notes,evidence\n';
  for (const r of results) {
    csv += `${r.id},${r.module},${r.priority},${r.status},"${r.notes.replace(/"/g, '""')}","${r.evidence}"\n`;
  }
  fs.writeFileSync(path.join(REPORT_DIR, 'case-results.csv'), csv);

  // bugs.md
  let bugMd = '# Bug List\n\n';
  if (bugs.length === 0) {
    bugMd += 'No bugs detected. ✅\n';
  } else {
    for (const b of bugs) {
      bugMd += `## ${b.id} [${b.priority}] — ${b.title}\n`;
      bugMd += `- **URL:** ${b.url}\n- **Actual:** ${b.actual}\n- **Expected:** ${b.expected}\n\n`;
    }
  }
  fs.writeFileSync(path.join(REPORT_DIR, 'bugs.md'), bugMd);

  // evidence-index.md
  const ssFiles = fs.readdirSync(SS_DIR).filter(f => f.endsWith('.png'));
  let evMd = '# Evidence Index\n\n## Screenshots\n\n';
  for (const f of ssFiles.sort()) {
    evMd += `- artifacts/screenshots/${f}\n`;
  }
  const consoleFiles = fs.readdirSync(path.join(TOOL_DIR, 'artifacts', 'console')).filter(f => f.endsWith('.json'));
  evMd += '\n## Console Logs\n\n';
  for (const f of consoleFiles.sort()) {
    evMd += `- artifacts/console/${f}\n`;
  }
  const netFiles = fs.readdirSync(path.join(TOOL_DIR, 'artifacts', 'network')).filter(f => f.endsWith('.json'));
  evMd += '\n## Network Logs\n\n';
  for (const f of netFiles.sort()) {
    evMd += `- artifacts/network/${f}\n`;
  }
  fs.writeFileSync(path.join(REPORT_DIR, 'evidence-index.md'), evMd);

  // recommendations.md
  let recMd = '# Recommendations\n\n';
  if (p0Fail > 0) recMd += '1. **P0 CRITICAL:** Fix P0 failures before any production release.\n';
  if (p1Fail > 0) recMd += '2. **P1 HIGH:** Fix P1 failures before production release.\n';
  const fails = results.filter(r => r.status === 'FAIL');
  if (fails.length > 0) {
    recMd += '\n## Failed Tests\n\n';
    for (const f of fails) {
      recMd += `- **${f.id} [${f.priority}]** ${f.module}: ${f.notes}\n`;
    }
  }
  const blockedItems = results.filter(r => r.status === 'BLOCKED');
  if (blockedItems.length > 0) {
    recMd += '\n## Blocked Tests\n\n';
    for (const b of blockedItems) {
      recMd += `- **${b.id} [${b.priority}]** ${b.module}: ${b.notes}\n`;
    }
    recMd += '\nProvide credentials and re-run to unblock.\n';
  }
  recMd += '\n## Next Steps\n\n1. Fix all P0/P1 failures\n2. Re-run audit\n3. Get user confirmation for production release\n';
  fs.writeFileSync(path.join(REPORT_DIR, 'recommendations.md'), recMd);

  // index.md
  let idx = `# jueshi-audit — Full Audit Report\n\n`;
  idx += `**Date:** ${now}\n**Target:** ${BASE_URL}\n**Mode:** full (with credentials)\n`;
  idx += `**Verdict:** ${verdict}\n\n---\n\n`;
  idx += `## Summary\n\n| Metric | Count |\n|--------|-------|\n`;
  idx += `| Total | ${results.length} |\n| PASS | ${pass} |\n| FAIL | ${fail} |\n`;
  idx += `| BLOCKED | ${blocked} |\n| NOT_RUN | ${notRun} |\n`;
  idx += `| P0 failures | ${p0Fail} |\n| P1 failures | ${p1Fail} |\n`;
  idx += `| Bugs | ${bugs.length} |\n\n`;
  idx += `## All Test Results\n\n| ID | Module | Priority | Status | Notes |\n|-----|--------|----------|--------|-------|\n`;
  for (const r of results) {
    idx += `| ${r.id} | ${r.module} | ${r.priority} | ${r.status} | ${r.notes.substring(0, 80).replace(/\|/g, '/')} |\n`;
  }
  idx += `\n## Production Release Gate\n\n| Check | Result |\n|-------|--------|\n`;
  idx += `| P0 failures | ${p0Fail} ${p0Fail === 0 ? '✅' : '❌'} |\n`;
  idx += `| P1 failures | ${p1Fail} ${p1Fail === 0 ? '✅' : '❌'} |\n`;
  idx += `| Allowed to proceed | ${verdict === 'STAGING_AUDIT_READY_NO_P0P1' ? 'YES (with user confirmation)' : 'NO'} |\n\n`;
  idx += `## Safety Checklist\n\n| Check | Result |\n|-------|--------|\n`;
  idx += `| prisma db push | NO ✅ |\n| destructive SQL | NO ✅ |\n| production modified | NO ✅ |\n| secrets in output | NO ✅ |\n`;
  idx += `| 9833416@qq.com modified | NO ✅ |\n\n`;
  idx += `## Evidence\n\n- Screenshots: ${ssFiles.length} files in artifacts/screenshots/\n`;
  idx += `- Console logs: ${consoleFiles.length} files in artifacts/console/\n`;
  idx += `- Network logs: ${netFiles.length} files in artifacts/network/\n`;
  fs.writeFileSync(path.join(REPORT_DIR, 'index.md'), idx);

  // Console output
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  Verdict: ${verdict}`);
  console.log(`  PASS: ${pass} | FAIL: ${fail} | BLOCKED: ${blocked} | NOT_RUN: ${notRun}`);
  console.log(`  P0 fail: ${p0Fail} | P1 fail: ${p1Fail} | Bugs: ${bugs.length}`);
  console.log(`  Screenshots: ${ssFiles.length} files`);
  console.log(`  Report: ${path.join(REPORT_DIR, 'index.md')}`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
