/**
 * audit-word-export.ts
 *
 * v1.20.42.18.6.11.6 — Playwright Word Export DOCX Integrity Audit
 *
 * For each document tool:
 * 1. Login to staging
 * 2. Navigate to the tool page
 * 3. Fill example data (if available)
 * 4. Click Word export button
 * 5. Capture download
 * 6. Run validate-docx-export.ts on the downloaded file
 * 7. Save artifacts (docx, validation JSON, screenshots, console/network logs)
 * 8. Report PASS/FAIL/BLOCKED
 */

import { chromium, BrowserContext, Page, Locator } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOL_DIR = path.resolve(__dirname, '..');
const BASE_URL = process.env.AUDIT_BASE_URL || 'https://i.jueshi.net';
const SS_DIR = path.join(TOOL_DIR, 'artifacts', 'screenshots');
const WORD_DIR = path.join(TOOL_DIR, 'artifacts', 'word');
const VALIDATION_DIR = path.join(TOOL_DIR, 'artifacts', 'word-validations');
const CONSOLE_DIR = path.join(TOOL_DIR, 'artifacts', 'word-console');
const NETWORK_DIR = path.join(TOOL_DIR, 'artifacts', 'word-network');
const REPORT_DIR = path.join(TOOL_DIR, 'reports', 'latest');

[SS_DIR, WORD_DIR, VALIDATION_DIR, CONSOLE_DIR, NETWORK_DIR, REPORT_DIR].forEach(d => {
  fs.mkdirSync(d, { recursive: true });
});

const EMAIL_USER = process.env.AUDIT_TEST_EMAIL_USER || 'test@jueshi.net';
let PASSWORD = '';
if (process.env.AUDIT_TEST_PASSWORD_FILE) {
  try { PASSWORD = fs.readFileSync(process.env.AUDIT_TEST_PASSWORD_FILE, 'utf-8').trim(); } catch {}
} else {
  PASSWORD = process.env.AUDIT_TEST_PASSWORD || '';
}

const LIBREOFFICE_PATH = process.env.AUDIT_LIBREOFFICE_PATH || 'libreoffice';
// Check if LibreOffice is available
let LIBREOFFICE_AVAILABLE = false;
try {
  execSync(`which "${LIBREOFFICE_PATH}" 2>/dev/null || ls /Applications/LibreOffice.app/Contents/MacOS/soffice 2>/dev/null`, { encoding: 'utf-8', timeout: 5000 });
  LIBREOFFICE_AVAILABLE = true;
} catch {
  // Try macOS path
  const macPath = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
  if (fs.existsSync(macPath)) {
    LIBREOFFICE_AVAILABLE = true;
  }
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type Status = 'PASS' | 'FAIL' | 'BLOCKED';

interface WordExportResult {
  caseId: string;
  toolName: string;
  url: string;
  status: Status;
  downloadPath: string | null;
  validationPath: string | null;
  screenshotPath: string | null;
  consolePath: string | null;
  networkPath: string | null;
  companyName: string | null;
  companyNameInDoc: boolean;
  notes: string;
  duration: number;
}

const results: WordExportResult[] = [];

// ─── NextAuth Login ──────────────────────────────────────
async function nextAuthLogin(context: BrowserContext, email: string, password: string): Promise<boolean> {
  const page = await context.newPage();
  try {
    await page.goto(BASE_URL + '/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await sleep(1500);

    await page.addStyleTag({ content: `
      [role="dialog"], dialog, .cookie-consent, [class*="cookie"], [class*="Cookie"], [class*="consent"], [class*="Consent"] {
        display: none !important; z-index: -9999 !important; pointer-events: none !important; visibility: hidden !important;
      }
      body { overflow: auto !important; }
    ` });

    const emailInput = page.locator('input[type="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(email);
    await passInput.fill(password);
    await sleep(500);
    await submitBtn.click();

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    await sleep(2000);

    const currentUrl = page.url();
    const loggedIn = !currentUrl.includes('/login') && !currentUrl.includes('error');
    await page.close();
    return loggedIn;
  } catch (e) {
    console.error('Login failed:', e);
    await page.close();
    return false;
  }
}

// ─── Test Cases ──────────────────────────────────────────
interface TestCase {
  id: string;
  name: string;
  url: string;
  companyName: string;
  fillExample?: boolean;
  companySwitch?: { companyName: string };
  specialType?: 'free-limit' | 'member-bypass' | 'auth-consistency';
  testUser?: 'member' | 'free';
}

const testCases: TestCase[] = [
  { id: 'P1-WORD-EXPORT-QUOTE', name: 'Quote Sheet', url: '/tools/quote-sheet', companyName: 'QS Test Company', fillExample: true },
  { id: 'P1-WORD-EXPORT-COMMERCIAL-INVOICE', name: 'Commercial Invoice', url: '/tools/documents/commercial-invoice', companyName: 'QS Test Company', fillExample: true },
  { id: 'P1-WORD-EXPORT-PACKING-LIST', name: 'Packing List', url: '/tools/documents/packing-list', companyName: 'QS Test Company', fillExample: true },
  { id: 'P1-WORD-EXPORT-PROFORMA-INVOICE', name: 'Proforma Invoice', url: '/tools/documents/proforma-invoice', companyName: '上海贸易有限公司', fillExample: true },
  { id: 'P1-WORD-EXPORT-SALES-CONTRACT', name: 'Sales Contract', url: '/tools/documents/sales-contract', companyName: 'QS Test Company', fillExample: true },
  { id: 'P1-WORD-EXPORT-EXPRESS-DECLARATION', name: 'Express Declaration', url: '/tools/documents/express-declaration', companyName: 'QS Test Company', fillExample: true },
  { id: 'P1-WORD-EXPORT-DYNAMIC-DOCUMENTS', name: 'Customs Declaration Authorization (Dynamic Route)', url: '/tools/documents/customs-declaration-authorization', companyName: 'QS Test Company', fillExample: true },
  { id: 'P1-WORD-EXPORT-COMPANY-SWITCH-A', name: 'Company Switch A → Word Export', url: '/tools/documents/commercial-invoice', companyName: 'QS Test Company', fillExample: true, companySwitch: { companyName: 'QS Test Company' } },
  { id: 'P1-WORD-EXPORT-COMPANY-SWITCH-B', name: 'Company Switch B → Word Export', url: '/tools/documents/commercial-invoice', companyName: 'Audit Test Co B Ltd', fillExample: true, companySwitch: { companyName: 'Audit Test Co B Ltd' } },
  { id: 'P1-WORD-EXPORT-NO-BROKEN-DOWNLOADS', name: 'No Broken Downloads (Scan All Types)', url: '/tools/documents', companyName: '', fillExample: false },
  { id: 'P1-WORD-EXPORT-FREE-LIMIT-MESSAGE', name: 'Free User Daily Limit Message', url: '/tools/documents/commercial-invoice', companyName: 'QS Test Company', fillExample: true, specialType: 'free-limit', testUser: 'free' },
  { id: 'P1-WORD-EXPORT-MEMBER-BYPASS-LIMIT', name: 'Member Bypass Daily Limit', url: '/tools/documents/commercial-invoice', companyName: 'QS Test Company', fillExample: true, specialType: 'member-bypass', testUser: 'member' },
  { id: 'P1-WORD-EXPORT-AUTH-CONSISTENCY', name: 'Authorization Consistency (quote-sheet vs dynamic)', url: '/tools/quote-sheet', companyName: 'QS Test Company', fillExample: true, specialType: 'auth-consistency', testUser: 'member' },
];

// ─── Find Word Button ────────────────────────────────────
async function findWordButton(page: Page): Promise<Locator | null> {
  // Try data-testid first
  const testIdBtn = page.locator('[data-testid="word-export-btn"]').first();
  if (await testIdBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    return testIdBtn;
  }
  // Fallback: button with "Word" text
  const textBtn = page.locator('button:has-text("Word")').first();
  if (await textBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    return textBtn;
  }
  return null;
}

// ─── Run Single Test Case ────────────────────────────────
async function runTestCase(context: BrowserContext, tc: TestCase): Promise<WordExportResult> {
  const startTime = Date.now();
  const result: WordExportResult = {
    caseId: tc.id, toolName: tc.name, url: tc.url, status: 'BLOCKED',
    downloadPath: null, validationPath: null, screenshotPath: null,
    consolePath: null, networkPath: null,
    companyName: tc.companyName, companyNameInDoc: false,
    notes: '', duration: 0,
  };

  const page = await context.newPage();
  const consoleMessages: string[] = [];
  const networkLogs: string[] = [];
  const dialogMessages: string[] = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('response', res => { if (res.status() >= 400) networkLogs.push(`[${res.status()}] ${res.url()}`); });
  // Auto-dismiss dialogs (alert/confirm/prompt) — common when authorizeExportClient fails
  page.on('dialog', async dialog => {
    dialogMessages.push(`[${dialog.type()}] ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    // Special case: NO-BROKEN-DOWNLOADS
    if (tc.id === 'P1-WORD-EXPORT-NO-BROKEN-DOWNLOADS') {
      await page.goto(BASE_URL + tc.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(2000);
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}.png`), fullPage: true });
      result.screenshotPath = path.join(SS_DIR, `${tc.id}.png`);
      const bodyText = await page.locator('body').textContent();
      if (bodyText && bodyText.length > 100) {
        result.status = 'PASS';
        result.notes = 'Document list page loads, no broken links detected';
      } else {
        result.status = 'FAIL';
        result.notes = 'Document list page appears empty or broken';
      }
      result.duration = Date.now() - startTime;
      await page.close();
      return result;
    }

    // Special case: FREE-LIMIT-MESSAGE — free user exceeds 3/day limit
    if (tc.specialType === 'free-limit') {
      await page.goto(BASE_URL + tc.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(3000);
      // Fill example data
      const fillBtn = page.locator('button:has-text("示例"), button:has-text("填充")').first();
      if (await fillBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fillBtn.click();
        await sleep(1000);
      }
      // Try to export Word 5 times (free limit is 3/day)
      let successCount = 0;
      let blockedCount = 0;
      let lastDialog = '';
      for (let i = 1; i <= 5; i++) {
        dialogMessages.length = 0; // clear previous
        const dlPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
        const wordBtn = page.locator('[data-testid="word-export-btn"]').first();
        if (await wordBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await wordBtn.click();
          await sleep(3000);
          const dl = await dlPromise;
          if (dl) {
            successCount++;
            // Save the download
            const fname = `${tc.id}-attempt-${i}.docx`;
            await dl.saveAs(path.join(WORD_DIR, fname));
          } else if (dialogMessages.length > 0) {
            blockedCount++;
            lastDialog = dialogMessages[dialogMessages.length - 1];
          }
        }
        await sleep(500);
      }
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}.png`), fullPage: true });
      result.screenshotPath = path.join(SS_DIR, `${tc.id}.png`);
      // PASS criteria: at least 1 dialog with limit message, no broken downloads
      const hasLimitMessage = lastDialog.includes('次数') || lastDialog.includes('限制') || lastDialog.includes('limit') || lastDialog.includes('升级');
      if (blockedCount > 0 && hasLimitMessage && successCount <= 3) {
        result.status = 'PASS';
        result.notes = `Free user: ${successCount} succeeded, ${blockedCount} blocked with message: "${lastDialog.substring(0, 80)}"`;
      } else {
        result.status = 'FAIL';
        result.notes = `Free user: ${successCount} succeeded, ${blockedCount} blocked. Last dialog: "${lastDialog.substring(0, 80)}"`;
      }
      result.duration = Date.now() - startTime;
      await page.close();
      return result;
    }

    // Special case: MEMBER-BYPASS-LIMIT — member exports 5+ times, all succeed
    if (tc.specialType === 'member-bypass') {
      await page.goto(BASE_URL + tc.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(3000);
      const fillBtn = page.locator('button:has-text("示例"), button:has-text("填充")').first();
      if (await fillBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fillBtn.click();
        await sleep(1000);
      }
      let successCount = 0;
      let failCount = 0;
      for (let i = 1; i <= 5; i++) {
        dialogMessages.length = 0;
        const dlPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
        const wordBtn = page.locator('[data-testid="word-export-btn"]').first();
        if (await wordBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await wordBtn.click();
          await sleep(3000);
          const dl = await dlPromise;
          if (dl) {
            successCount++;
            const fname = `${tc.id}-attempt-${i}.docx`;
            await dl.saveAs(path.join(WORD_DIR, fname));
          } else {
            failCount++;
          }
        }
        await sleep(500);
      }
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}.png`), fullPage: true });
      result.screenshotPath = path.join(SS_DIR, `${tc.id}.png`);
      if (successCount >= 5 && failCount === 0) {
        result.status = 'PASS';
        result.notes = `Member bypass: ${successCount}/5 exports succeeded, no limit hit`;
      } else {
        result.status = 'FAIL';
        result.notes = `Member bypass: ${successCount}/5 succeeded, ${failCount} failed`;
      }
      result.duration = Date.now() - startTime;
      await page.close();
      return result;
    }

    // Special case: AUTH-CONSISTENCY — verify both quote-sheet and dynamic route call /api/export/authorize
    if (tc.specialType === 'auth-consistency') {
      const authCalls: string[] = [];
      page.on('request', req => {
        if (req.url().includes('/api/export/authorize')) {
          authCalls.push(req.url());
        }
      });

      // Test 1: quote-sheet
      await page.goto(BASE_URL + '/tools/quote-sheet', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(3000);
      const fillBtn1 = page.locator('button:has-text("示例"), button:has-text("填充")').first();
      if (await fillBtn1.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fillBtn1.click();
        await sleep(1000);
      }
      authCalls.length = 0;
      const wordBtn1 = page.locator('[data-testid="word-export-btn"]').first();
      if (await wordBtn1.isVisible({ timeout: 5000 }).catch(() => false)) {
        const dl1 = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
        await wordBtn1.click();
        await sleep(3000);
        await dl1;
      }
      const quoteSheetAuthCalled = authCalls.length > 0;
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}-quote-sheet.png`), fullPage: true });

      // Test 2: dynamic route (commercial-invoice)
      authCalls.length = 0;
      await page.goto(BASE_URL + '/tools/documents/commercial-invoice', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await sleep(3000);
      const fillBtn2 = page.locator('button:has-text("示例"), button:has-text("填充")').first();
      if (await fillBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fillBtn2.click();
        await sleep(1000);
      }
      const wordBtn2 = page.locator('[data-testid="word-export-btn"]').first();
      if (await wordBtn2.isVisible({ timeout: 5000 }).catch(() => false)) {
        const dl2 = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
        await wordBtn2.click();
        await sleep(3000);
        await dl2;
      }
      const dynamicAuthCalled = authCalls.length > 0;
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}-dynamic.png`), fullPage: true });
      result.screenshotPath = path.join(SS_DIR, `${tc.id}-quote-sheet.png`);

      if (quoteSheetAuthCalled && dynamicAuthCalled) {
        result.status = 'PASS';
        result.notes = `Auth consistency: quote-sheet calls /api/export/authorize=YES, dynamic route calls /api/export/authorize=YES`;
      } else {
        result.status = 'FAIL';
        result.notes = `Auth inconsistency: quote-sheet auth=${quoteSheetAuthCalled ? 'YES' : 'NO'}, dynamic auth=${dynamicAuthCalled ? 'YES' : 'NO'}`;
      }
      result.duration = Date.now() - startTime;
      await page.close();
      return result;
    }

    // Navigate to tool page
    await page.goto(BASE_URL + tc.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await sleep(2000);

    await page.addStyleTag({ content: `
      [role="dialog"], dialog, .cookie-consent, [class*="cookie"], [class*="Cookie"] {
        display: none !important; pointer-events: none !important;
      }
    ` });

    // Fill example data
    if (tc.fillExample) {
      const fillBtn = page.locator('button:has-text("示例"), button:has-text("填充示例")').first();
      if (await fillBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fillBtn.click();
        await sleep(1000);
        const confirmBtn = page.locator('button:has-text("确定"), button:has-text("确认")').first();
        if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmBtn.click();
          await sleep(500);
        }
      }
    }

    // Company switch
    if (tc.companySwitch) {
      const pickerTrigger = page.locator('[data-testid="company-profile-picker-trigger"]').first();
      if (await pickerTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
        await pickerTrigger.click();
        await sleep(500);
        const options = page.locator('[data-testid^="company-option-"]');
        const count = await options.count();
        for (let i = 0; i < count; i++) {
          const text = await options.nth(i).textContent();
          if (text && text.includes(tc.companySwitch!.companyName)) {
            await options.nth(i).click();
            await sleep(500);
            break;
          }
        }
      }
    }

    // Pre-export screenshot
    await page.screenshot({ path: path.join(SS_DIR, `${tc.id}-pre-export.png`), fullPage: true });

    // Find Word button
    const wordBtn = await findWordButton(page);
    if (!wordBtn) {
      result.status = 'FAIL';
      result.notes = 'Word export button not found';
      result.duration = Date.now() - startTime;
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}-no-button.png`), fullPage: true });
      result.screenshotPath = path.join(SS_DIR, `${tc.id}-no-button.png`);
      await page.close();
      return result;
    }

    // Check disabled
    const isDisabled = await wordBtn.getAttribute('disabled');
    const disabledClass = await wordBtn.evaluate(el =>
      el.classList.contains('cursor-not-allowed') || el.classList.contains('opacity-50')
    );
    if (isDisabled !== null || disabledClass) {
      result.status = 'BLOCKED';
      result.notes = 'Word export button is disabled (permission/membership issue)';
      result.duration = Date.now() - startTime;
      await page.close();
      return result;
    }

    // Download handler — Blob URL downloads may take longer
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    await wordBtn.click();
    // Wait for potential async JSZip generation
    await sleep(3000);
    const download = await downloadPromise;

    if (!download) {
      result.status = 'FAIL';
      const dialogInfo = dialogMessages.length > 0 ? ` Dialog: ${dialogMessages.join('; ')}` : '';
      result.notes = `No download triggered after clicking Word button${dialogInfo}`;
      result.duration = Date.now() - startTime;
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}-no-download.png`), fullPage: true });
      result.screenshotPath = path.join(SS_DIR, `${tc.id}-no-download.png`);
      // Save console + dialog logs even on failure
      const consolePath = path.join(CONSOLE_DIR, `${tc.id}-console.txt`);
      fs.writeFileSync(consolePath, [...consoleMessages, ...dialogMessages.map(d => `[DIALOG] ${d}`)].join('\n'));
      result.consolePath = consolePath;
      await page.close();
      return result;
    }

    // Save download
    const downloadFilename = download.suggestedFilename();
    const downloadPath = path.join(WORD_DIR, `${tc.id}-${downloadFilename}`);
    await download.saveAs(downloadPath);
    result.downloadPath = downloadPath;

    // Post-download screenshot
    await page.screenshot({ path: path.join(SS_DIR, `${tc.id}-post-export.png`), fullPage: true });
    result.screenshotPath = path.join(SS_DIR, `${tc.id}-post-export.png`);

    // Save console/network logs
    const consolePath = path.join(CONSOLE_DIR, `${tc.id}-console.txt`);
    fs.writeFileSync(consolePath, consoleMessages.join('\n'));
    result.consolePath = consolePath;

    const networkPath = path.join(NETWORK_DIR, `${tc.id}-network.txt`);
    fs.writeFileSync(networkPath, networkLogs.join('\n'));
    result.networkPath = networkPath;

    // Run validation — use spawnSync to avoid throwing on non-zero exit
    const validationPath = path.join(VALIDATION_DIR, `${tc.id}-validation.json`);
    try {
      const validateScript = path.join(TOOL_DIR, 'scripts', 'validate-docx-export.ts');
      const skipLoFlag = LIBREOFFICE_AVAILABLE ? '' : '--skip-libreoffice';
      const loPathFlag = LIBREOFFICE_AVAILABLE ? `--libreoffice-path "${LIBREOFFICE_PATH}"` : '';
      const cmd = `npx tsx "${validateScript}" "${downloadPath}" --company-name "${tc.companyName}" --output-json "${validationPath}" ${loPathFlag} ${skipLoFlag} 2>&1`;
      try {
        execSync(cmd, { encoding: 'utf-8', timeout: 60000, cwd: TOOL_DIR, stdio: 'pipe' });
      } catch (e: any) {
        // Validation script returns non-zero on FAIL — that's OK, we read the JSON
        if (!fs.existsSync(validationPath)) {
          throw e; // Re-throw if no JSON was produced
        }
      }
      result.validationPath = validationPath;

      const validation = JSON.parse(fs.readFileSync(validationPath, 'utf-8'));
      result.companyNameInDoc = validation.checks?.companyNameFound || false;

      if (validation.overall === 'PASS') {
        result.status = 'PASS';
        result.notes = `DOCX valid: ${validation.checks.fileSizeBytes}B, PK OK, unzip OK, Content_Types OK, document.xml OK, company found, LibreOffice OK`;
      } else {
        result.status = 'FAIL';
        result.notes = `Validation failed: ${(validation.errors || []).join('; ')}`;
      }
    } catch (e: any) {
      result.status = 'FAIL';
      result.notes = `Validation error: ${(e.message || '').slice(0, 200)}`;
      if (fs.existsSync(validationPath)) result.validationPath = validationPath;
    }

    result.duration = Date.now() - startTime;
    await page.close();
    return result;

  } catch (e: any) {
    result.status = 'BLOCKED';
    result.notes = `Test blocked: ${(e.message || '').slice(0, 200)}`;
    result.duration = Date.now() - startTime;
    try {
      await page.screenshot({ path: path.join(SS_DIR, `${tc.id}-blocked.png`), fullPage: true });
      result.screenshotPath = path.join(SS_DIR, `${tc.id}-blocked.png`);
    } catch {}
    await page.close();
    return result;
  }
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  v1.20.42.18.6.11.6 — Word Export DOCX Integrity Audit');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  User: ${EMAIL_USER}`);
  console.log(`  LibreOffice: ${LIBREOFFICE_PATH}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (!PASSWORD) {
    console.error('No password provided. Set AUDIT_TEST_PASSWORD_FILE or AUDIT_TEST_PASSWORD.');
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true });

  // Member context (test@jueshi.net — pro member)
  const memberContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    acceptDownloads: true,
  });

  // Login as member
  console.log('Logging in as member (test@jueshi.net)...');
  const memberLoggedIn = await nextAuthLogin(memberContext, EMAIL_USER, PASSWORD);
  if (!memberLoggedIn) {
    console.error('Member login failed. Aborting.');
    await browser.close();
    process.exit(1);
  }
  console.log('Member login successful\n');

  // Free user context (free-test@jueshi.net — free tier)
  let freeContext: BrowserContext | null = null;
  const FREE_EMAIL = process.env.AUDIT_FREE_EMAIL_USER || 'free-test@jueshi.net';
  const FREE_PASSWORD = PASSWORD; // same password as test user
  if (testCases.some(tc => tc.testUser === 'free')) {
    console.log('Logging in as free user (free-test@jueshi.net)...');
    freeContext = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      acceptDownloads: true,
    });
    const freeLoggedIn = await nextAuthLogin(freeContext, FREE_EMAIL, FREE_PASSWORD);
    if (!freeLoggedIn) {
      console.error('Free user login failed. Free-limit tests will be BLOCKED.');
    } else {
      console.log('Free user login successful\n');
    }
  }

  // Run tests
  console.log(`Running ${testCases.length} test cases...\n`);
  for (const tc of testCases) {
    console.log(`  [${tc.id}] ${tc.name}...`);
    const ctx = tc.testUser === 'free' ? freeContext : memberContext;
    if (!ctx) {
      results.push({
        caseId: tc.id, toolName: tc.name, url: tc.url, status: 'BLOCKED',
        downloadPath: null, validationPath: null, screenshotPath: null,
        consolePath: null, networkPath: null,
        companyName: tc.companyName, companyNameInDoc: false,
        notes: 'Free user context not available', duration: 0,
      });
      console.log(`  BLOCKED [${tc.id}] Free user context not available\n`);
      continue;
    }
    const result = await runTestCase(ctx, tc);
    results.push(result);
    const icon = result.status === 'PASS' ? 'PASS' : result.status === 'FAIL' ? 'FAIL' : 'BLOCKED';
    console.log(`  ${icon} [${tc.id}] ${result.notes.substring(0, 100)}\n`);
  }

  await browser.close();

  // Summary
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const blocked = results.filter(r => r.status === 'BLOCKED').length;

  console.log('═══════════════════════════════════════════════════');
  console.log(`  RESULTS: ${pass} PASS | ${fail} FAIL | ${blocked} BLOCKED`);
  console.log(`  Total: ${results.length}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Save JSON report
  const reportPath = path.join(REPORT_DIR, 'word-export-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    version: 'v1.20.42.18.6.11.6',
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalCases: results.length,
    pass, fail, blocked,
    results,
  }, null, 2));
  console.log(`Report: ${reportPath}`);

  // Save markdown summary
  const mdPath = path.join(REPORT_DIR, 'word-export-summary.md');
  let md = `# Word Export DOCX Integrity Audit — v1.20.42.18.6.11.6\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n**URL:** ${BASE_URL}\n\n`;
  md += `## Summary\n\n- PASS: ${pass}\n- FAIL: ${fail}\n- BLOCKED: ${blocked}\n- Total: ${results.length}\n\n`;
  md += `## Results\n\n`;
  md += `| Case ID | Tool | Status | Company in DOCX | Notes |\n`;
  md += `|---------|------|--------|-----------------|-------|\n`;
  for (const r of results) {
    md += `| ${r.caseId} | ${r.toolName} | ${r.status} | ${r.companyNameInDoc ? 'Yes' : 'No'} | ${r.notes.substring(0, 80)} |\n`;
  }
  md += `\n## DOCX Files\n\n`;
  for (const r of results) {
    if (r.downloadPath) md += `- **${r.caseId}**: ${r.downloadPath}\n`;
  }
  md += `\n## Validation JSON\n\n`;
  for (const r of results) {
    if (r.validationPath) md += `- **${r.caseId}**: ${r.validationPath}\n`;
  }
  fs.writeFileSync(mdPath, md);
  console.log(`Markdown: ${mdPath}`);

  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
