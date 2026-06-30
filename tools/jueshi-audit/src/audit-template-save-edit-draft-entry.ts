#!/usr/bin/env tsx
/**
 * Template Save/Edit/Draft Entry Audit
 * v1.20.42.18.6.16.6.35
 *
 * Tests:
 * 1. Save success shows "查看我的模板" link
 * 2. Save success shows "打开已保存模板" link
 * 3. /workspace/templates edit link works
 * 4. /tools/template-studio saved template edit works
 * 5. Draft restore button works
 * 6. Draft discard button works
 * 7. Multipage PNG shows notice
 * 8. /tools has real CTA banner
 */

import { chromium, type Page, type Browser, type BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

// ============================================================
// Configuration
// ============================================================

const BASE_URL = process.env.AUDIT_BASE_URL || "https://i.jueshi.net";
const TEST_EMAIL = process.env.AUDIT_TEST_EMAIL || "test@jueshi.net";
const TEST_PASSWORD_FILE = process.env.AUDIT_TEST_PASSWORD_FILE || "/tmp/staging_pwd.txt";
const EVIDENCE_DIR = path.join(process.cwd(), "evidence", `save-edit-draft-${Date.now()}`);

// ============================================================
// Types
// ============================================================

interface AuditResult {
  id: string;
  name: string;
  status: "PASS" | "FAIL" | "BLOCKED";
  severity: "P0" | "P1" | "P2" | "P3";
  message: string;
  evidence?: string;
}

// ============================================================
// Helper: Login in isolated context
// ============================================================

async function loginInContext(context: BrowserContext): Promise<boolean> {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', TEST_EMAIL);
    const pwd = fs.readFileSync(TEST_PASSWORD_FILE, "utf-8").trim();
    await page.fill('input[type="password"]', pwd);
    
    // Accept cookies if present
    try {
      const cookieBtn = await page.$('button:has-text("Accept"), button:has-text("接受"), button:has-text("我知道了")');
      if (cookieBtn) await cookieBtn.click({ timeout: 2000 });
    } catch { /* ignore */ }
    
    await page.click('button[type="submit"]');
    await page.waitForURL("**/tools**", { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const hasError = await page.$('text="请先登录"');
    if (hasError || !currentUrl.includes("/tools")) {
      console.error("Login failed - still on login page or error shown");
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  } finally {
    await page.close();
  }
}

// ============================================================
// Helper: Check for error messages
// ============================================================

async function hasErrorMessage(page: Page): Promise<string | null> {
  const errorTexts = [
    "this page couldn't load",
    "页面加载失败",
    "工作台暂时无法加载",
  ];
  
  for (const errorText of errorTexts) {
    const found = await page.$(`text="${errorText}"`);
    if (found) return errorText;
  }
  return null;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Template Save/Edit/Draft Entry Audit ===");
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  if (!fs.existsSync(TEST_PASSWORD_FILE)) {
    console.error(`Password file not found: ${TEST_PASSWORD_FILE}`);
    process.exit(1);
  }

  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  console.log(`Evidence directory: ${EVIDENCE_DIR}\n`);

  const results: AuditResult[] = [];
  const browser = await chromium.launch({ headless: true });

  try {
    // ============================================================
    // TEST 1: /tools has real CTA banner (unauthenticated)
    // ============================================================
    console.log("=== TEST 1: /tools has real CTA banner ===");
    const unauthContext1 = await browser.newContext();
    const page1 = await unauthContext1.newPage();
    await page1.goto(`${BASE_URL}/tools`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page1.waitForTimeout(2000);

    const hasBanner = await page1.$('[data-testid="tools-template-cta-banner"]');
    const hasTitle = await page1.$('text="模板工作室"');
    const hasCTAs = await page1.$$eval('a[href*="template-studio"]', els => els.length >= 2);

    results.push({
      id: "TS-TOOLS-HAS-REAL-CTA-BANNER",
      name: "/tools has real CTA banner",
      status: hasBanner && hasTitle && hasCTAs ? "PASS" : "FAIL",
      severity: "P0",
      message: hasBanner && hasTitle && hasCTAs
        ? "Banner with title and CTAs found"
        : `Missing: banner=${!!hasBanner}, title=${!!hasTitle}, ctas=${hasCTAs}`,
      evidence: `${EVIDENCE_DIR}/tools-banner.png`,
    });

    await page1.screenshot({ path: `${EVIDENCE_DIR}/tools-banner.png`, fullPage: false });
    await page1.close();
    await unauthContext1.close();

    // ============================================================
    // TEST 2-7: Authenticated tests
    // ============================================================
    const authContext = await browser.newContext();
    const loginSuccess = await loginInContext(authContext);

    if (!loginSuccess) {
      results.push({
        id: "TS-AUTH-LOGIN",
        name: "Authentication login",
        status: "FAIL",
        severity: "P0",
        message: "Login failed",
      });
      throw new Error("Login failed");
    }

    // ============================================================
    // TEST 2: Save success shows links
    // ============================================================
    console.log("\n=== TEST 2: Save success shows links ===");
    const page2 = await authContext.newPage();
    await page2.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page2.waitForTimeout(3000);

    // Add a text element
    const addTextBtn = await page2.$('button:has-text("文本"), button:has-text("添加文本")');
    if (addTextBtn) {
      await addTextBtn.click();
      await page2.waitForTimeout(1000);
    }

    // Save the template
    const saveBtn = await page2.$('[data-testid="canvas-save-button"]');
    if (saveBtn) {
      await saveBtn.click();
      await page2.waitForTimeout(3000);

      const hasViewMyTemplates = await page2.$('[data-testid="canvas-view-my-templates-link"]');
      const hasOpenSaved = await page2.$('[data-testid="canvas-open-saved-template-link"]');

      results.push({
        id: "TS-CANVAS-SAVE-SUCCESS-HAS-OPEN-SAVED-LINK",
        name: "Save success shows '查看我的模板'",
        status: hasViewMyTemplates ? "PASS" : "FAIL",
        severity: "P0",
        message: hasViewMyTemplates ? "'查看我的模板' link found" : "'查看我的模板' link not found",
        evidence: `${EVIDENCE_DIR}/save-success.png`,
      });

      results.push({
        id: "TS-CANVAS-SAVE-SUCCESS-HAS-OPEN-SAVED-LINK-2",
        name: "Save success shows '打开已保存模板'",
        status: hasOpenSaved ? "PASS" : "FAIL",
        severity: "P0",
        message: hasOpenSaved ? "'打开已保存模板' link found" : "'打开已保存模板' link not found",
        evidence: `${EVIDENCE_DIR}/save-success.png`,
      });

      await page2.screenshot({ path: `${EVIDENCE_DIR}/save-success.png`, fullPage: false });
    } else {
      results.push({
        id: "TS-CANVAS-SAVE-SUCCESS-HAS-OPEN-SAVED-LINK",
        name: "Save success shows links",
        status: "BLOCKED",
        severity: "P0",
        message: "Save button not found",
      });
    }

    await page2.close();

    // ============================================================
    // TEST 3: /workspace/templates edit link works
    // ============================================================
    console.log("\n=== TEST 3: /workspace/templates edit link works ===");
    const page3 = await authContext.newPage();
    await page3.goto(`${BASE_URL}/workspace/templates`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page3.waitForTimeout(3000);

    const editLink = await page3.$('[data-testid^="workspace-edit-"]');
    if (editLink) {
      await editLink.click();
      await page3.waitForLoadState("domcontentloaded", { timeout: 30000 });
      await page3.waitForTimeout(3000);

      const editError = await hasErrorMessage(page3);
      const hasEditor = await page3.$('[data-testid="template-studio-editor"]');

      results.push({
        id: "TS-WORKSPACE-TEMPLATE-EDIT-OPENS",
        name: "/workspace/templates edit link works",
        status: !editError && hasEditor ? "PASS" : "FAIL",
        severity: "P0",
        message: !editError && hasEditor ? "Edit page loaded successfully" : editError ? `Error: ${editError}` : "Editor not found",
        evidence: `${EVIDENCE_DIR}/workspace-edit.png`,
      });

      await page3.screenshot({ path: `${EVIDENCE_DIR}/workspace-edit.png`, fullPage: false });
    } else {
      results.push({
        id: "TS-WORKSPACE-TEMPLATE-EDIT-OPENS",
        name: "/workspace/templates edit link works",
        status: "BLOCKED",
        severity: "P0",
        message: "No edit link found",
      });
    }

    await page3.close();

    // ============================================================
    // TEST 4: /tools/template-studio saved template edit works
    // ============================================================
    console.log("\n=== TEST 4: /tools/template-studio saved template edit works ===");
    const page4 = await authContext.newPage();
    await page4.goto(`${BASE_URL}/tools/template-studio`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page4.waitForTimeout(3000);

    const savedEditLink = await page4.$('[data-testid^="edit-template-user-"]');
    if (savedEditLink) {
      await savedEditLink.click();
      await page4.waitForLoadState("domcontentloaded", { timeout: 30000 });
      await page4.waitForTimeout(3000);

      const editError = await hasErrorMessage(page4);
      const hasEditor = await page4.$('[data-testid="template-studio-editor"]');

      results.push({
        id: "TS-TEMPLATE-STUDIO-SAVED-CARD-OPENS",
        name: "/tools/template-studio saved template edit works",
        status: !editError && hasEditor ? "PASS" : "FAIL",
        severity: "P0",
        message: !editError && hasEditor ? "Edit page loaded successfully" : editError ? `Error: ${editError}` : "Editor not found",
        evidence: `${EVIDENCE_DIR}/studio-edit.png`,
      });

      await page4.screenshot({ path: `${EVIDENCE_DIR}/studio-edit.png`, fullPage: false });
    } else {
      results.push({
        id: "TS-TEMPLATE-STUDIO-SAVED-CARD-OPENS",
        name: "/tools/template-studio saved template edit works",
        status: "BLOCKED",
        severity: "P0",
        message: "No saved template edit link found",
      });
    }

    await page4.close();

    // ============================================================
    // TEST 5-6: Draft restore/discard
    // ============================================================
    console.log("\n=== TEST 5-6: Draft restore/discard ===");
    const page5 = await authContext.newPage();
    await page5.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page5.waitForTimeout(3000);

    // Add content to create draft
    const addTextBtn2 = await page5.$('button:has-text("文本"), button:has-text("添加文本")');
    if (addTextBtn2) {
      await addTextBtn2.click();
      await page5.waitForTimeout(2000);
    }

    // Refresh to trigger draft restore banner
    await page5.reload();
    await page5.waitForTimeout(3000);

    const hasDraftBanner = await page5.$('[data-testid="canvas-draft-restore-banner"]');
    const restoreBtn = await page5.$('[data-testid="canvas-restore-draft-button"]');
    const discardBtn = await page5.$('[data-testid="canvas-discard-draft-button"]');

    if (hasDraftBanner && restoreBtn) {
      await restoreBtn.click();
      await page5.waitForTimeout(2000);
      const bannerAfterRestore = await page5.$('[data-testid="canvas-draft-restore-banner"]');
      
      results.push({
        id: "TS-DRAFT-RESTORE-BUTTON-WORKS",
        name: "Draft restore button works",
        status: !bannerAfterRestore ? "PASS" : "FAIL",
        severity: "P0",
        message: !bannerAfterRestore ? "Draft restored, banner disappeared" : "Banner still visible after restore",
        evidence: `${EVIDENCE_DIR}/draft-restore.png`,
      });

      await page5.screenshot({ path: `${EVIDENCE_DIR}/draft-restore.png`, fullPage: false });
    } else {
      results.push({
        id: "TS-DRAFT-RESTORE-BUTTON-WORKS",
        name: "Draft restore button works",
        status: hasDraftBanner ? "FAIL" : "BLOCKED",
        severity: "P0",
        message: hasDraftBanner ? "Restore button not found" : "Draft banner not shown",
      });
    }

    // Test discard
    await page5.reload();
    await page5.waitForTimeout(3000);
    const hasDraftBanner2 = await page5.$('[data-testid="canvas-draft-restore-banner"]');
    const discardBtn2 = await page5.$('[data-testid="canvas-discard-draft-button"]');

    if (hasDraftBanner2 && discardBtn2) {
      await discardBtn2.click();
      await page5.waitForTimeout(2000);
      const bannerAfterDiscard = await page5.$('[data-testid="canvas-draft-restore-banner"]');
      
      results.push({
        id: "TS-DRAFT-DISCARD-WORKS",
        name: "Draft discard button works",
        status: !bannerAfterDiscard ? "PASS" : "FAIL",
        severity: "P0",
        message: !bannerAfterDiscard ? "Draft discarded, banner disappeared" : "Banner still visible after discard",
        evidence: `${EVIDENCE_DIR}/draft-discard.png`,
      });

      await page5.screenshot({ path: `${EVIDENCE_DIR}/draft-discard.png`, fullPage: false });
    } else {
      results.push({
        id: "TS-DRAFT-DISCARD-WORKS",
        name: "Draft discard button works",
        status: hasDraftBanner2 ? "FAIL" : "BLOCKED",
        severity: "P0",
        message: hasDraftBanner2 ? "Discard button not found" : "Draft banner not shown",
      });
    }

    await page5.close();

    // ============================================================
    // TEST 7: Multipage PNG notice
    // ============================================================
    console.log("\n=== TEST 7: Multipage PNG notice ===");
    const page6 = await authContext.newPage();
    await page6.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page6.waitForTimeout(3000);

    // Set batch mode to repeat
    const batchModeSelect = await page6.$('[data-testid="canvas-batch-mode"]');
    if (batchModeSelect) {
      await batchModeSelect.selectOption("repeat");
      await page6.waitForTimeout(1000);

      // Set package count > 1
      const packageCountInput = await page6.$('input[type="number"]');
      if (packageCountInput) {
        await packageCountInput.fill("3");
        await page6.waitForTimeout(1000);
      }

      const hasMultipageNotice = await page6.$('[data-testid="canvas-multipage-png-notice"]');

      results.push({
        id: "TS-MULTIPAGE-PNG-NOT-BLANK-OR_DISABLED",
        name: "Multipage PNG shows notice",
        status: hasMultipageNotice ? "PASS" : "FAIL",
        severity: "P1",
        message: hasMultipageNotice ? "Multipage PNG notice shown" : "Multipage PNG notice not shown",
        evidence: `${EVIDENCE_DIR}/multipage-png.png`,
      });

      await page6.screenshot({ path: `${EVIDENCE_DIR}/multipage-png.png`, fullPage: false });
    } else {
      results.push({
        id: "TS-MULTIPAGE-PNG-NOT-BLANK-OR_DISABLED",
        name: "Multipage PNG shows notice",
        status: "BLOCKED",
        severity: "P1",
        message: "Batch mode selector not found",
      });
    }

    await page6.close();
    await authContext.close();

  } finally {
    await browser.close();
  }

  // ============================================================
  // RESULTS
  // ============================================================
  console.log("\n=== RESULTS ===");
  results.forEach(r => {
    const icon = r.status === "PASS" ? "✅" : r.status === "FAIL" ? "❌" : "⛔";
    console.log(`${icon} [${r.id}] ${r.name}: ${r.status} — ${r.message}`);
  });

  const passCount = results.filter(r => r.status === "PASS").length;
  const failCount = results.filter(r => r.status === "FAIL").length;
  const blockedCount = results.filter(r => r.status === "BLOCKED").length;

  console.log(`\n=== SUMMARY ===`);
  console.log(`PASS: ${passCount} / ${results.length}`);
  console.log(`FAIL: ${failCount} / ${results.length}`);
  console.log(`BLOCKED: ${blockedCount} / ${results.length}`);
  console.log(`Evidence: ${EVIDENCE_DIR}`);

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error("Audit failed:", err);
  process.exit(1);
});
