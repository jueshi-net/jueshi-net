#!/usr/bin/env tsx
/**
 * Template Routes Runtime Audit v2
 * v1.20.42.18.6.16.6.31
 *
 * FIXED: Use separate browser contexts for authenticated vs unauthenticated tests
 * - Unauthenticated tests use isolated context
 * - Authenticated tests use separate context with fresh login
 * - No cookie pollution between test cases
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
const EVIDENCE_DIR = path.join(process.cwd(), "evidence", `template-routes-runtime-${Date.now()}`);

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
    
    // Verify we're logged in by checking we're on /tools page and no error
    const currentUrl = page.url();
    const hasError = await page.$('text="请先登录"');
    if (hasError || !currentUrl.includes("/tools")) {
      console.error("Login failed - still on login page or error shown");
      console.error("Current URL:", currentUrl);
      await page.screenshot({ path: `${EVIDENCE_DIR}/login-debug.png` });
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
    "请先登录",
  ];
  
  for (const errorText of errorTexts) {
    const found = await page.$(`text="${errorText}"`);
    if (found) return errorText;
  }
  return null;
}

// ============================================================
// Audit Tests
// ============================================================

async function runAudit(): Promise<AuditResult[]> {
  const results: AuditResult[] = [];
  let browser: Browser | null = null;

  try {
    // Create evidence directory
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    console.log(`Evidence directory: ${EVIDENCE_DIR}`);

    browser = await chromium.launch({ headless: true });

    // ============================================================
    // TEST 1: /tools has real CTA banner (no auth needed)
    // ============================================================
    console.log("\n=== TEST 1: /tools banner (unauthenticated) ===");
    const unauthContext1 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page1 = await unauthContext1.newPage();
    
    await page1.goto(`${BASE_URL}/tools`, { waitUntil: "networkidle", timeout: 60000 });
    await page1.waitForTimeout(2000);

    const hasBannerTitle = await page1.$('h1:has-text("工具中心"), h2:has-text("工具中心")');
    const hasBannerSubtitle = await page1.$('p:has-text("实用工具"), p:has-text("出海"), p:has-text("一站式")');
    const hasDocumentsCTA = await page1.$('a[href="/tools/documents"]');
    const hasTemplateStudioCTA = await page1.$('a[href="/tools/template-studio"]');
    const hasMyTemplatesCTA = await page1.$('a[href="/workspace/templates"]');

    const bannerPass = !!(hasBannerTitle && hasBannerSubtitle && hasDocumentsCTA && hasTemplateStudioCTA && hasMyTemplatesCTA);
    
    results.push({
      id: "TS-TOOLS-HAS-REAL-CTA-BANNER",
      name: "/tools has real CTA banner",
      status: bannerPass ? "PASS" : "FAIL",
      severity: "P0",
      message: bannerPass
        ? "Banner with title, subtitle, and 3 CTAs found"
        : `Banner incomplete: title=${!!hasBannerTitle}, subtitle=${!!hasBannerSubtitle}, docs=${!!hasDocumentsCTA}, studio=${!!hasTemplateStudioCTA}, templates=${!!hasMyTemplatesCTA}`,
      evidence: `${EVIDENCE_DIR}/tools-banner.png`,
    });

    await page1.screenshot({ path: `${EVIDENCE_DIR}/tools-banner.png`, fullPage: false });
    await page1.close();
    await unauthContext1.close();

    // ============================================================
    // TEST 2: /tools/template-studio loads (authenticated)
    // ============================================================
    console.log("\n=== TEST 2: /tools/template-studio (authenticated) ===");
    const authContext2 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const loggedIn2 = await loginInContext(authContext2);
    
    if (!loggedIn2) {
      results.push({
        id: "TS-TEMPLATE-STUDIO-PAGE-LOADS",
        name: "/tools/template-studio loads",
        status: "BLOCKED",
        severity: "P0",
        message: "Cannot login to test",
      });
    } else {
      const page2 = await authContext2.newPage();
      await page2.goto(`${BASE_URL}/tools/template-studio`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page2.waitForTimeout(3000);

      const error = await hasErrorMessage(page2);
      const hasStartDesign = await page2.$('a:has-text("开始设计"), button:has-text("开始设计")');
      const hasMyTemplates = await page2.$('a:has-text("我的模板"), a:has-text("我的模板")');
      const hasTemplateStudioList = await page2.$('[data-testid="template-studio-list"], h1:has-text("模板工作室")');

      const pagePass = !error && hasStartDesign && hasMyTemplates && hasTemplateStudioList;
      
      results.push({
        id: "TS-TEMPLATE-STUDIO-PAGE-LOADS",
        name: "/tools/template-studio loads",
        status: pagePass ? "PASS" : "FAIL",
        severity: "P0",
        message: pagePass
          ? "Page loaded with '开始设计' and '我的模板'"
          : error ? `Error found: ${error}` : `Missing: startDesign=${!!hasStartDesign}, myTemplates=${!!hasMyTemplates}, list=${!!hasTemplateStudioList}`,
        evidence: `${EVIDENCE_DIR}/template-studio.png`,
      });

      await page2.screenshot({ path: `${EVIDENCE_DIR}/template-studio.png`, fullPage: false });
      await page2.close();
    }
    await authContext2.close();

    // ============================================================
    // TEST 3: /workspace/templates unauth handled (unauthenticated)
    // ============================================================
    console.log("\n=== TEST 3: /workspace/templates (unauthenticated) ===");
    const unauthContext3 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page3 = await unauthContext3.newPage();
    
    await page3.goto(`${BASE_URL}/workspace/templates`, { waitUntil: "networkidle", timeout: 60000 });
    await page3.waitForTimeout(3000);

    const currentUrl = page3.url();
    const isRedirectedToLogin = currentUrl.includes("/login");
    const hasLoginPrompt = await page3.$('input[type="email"]') || await page3.$('input[type="password"]') || await page3.$('text="请先登录"');
    const hasLoadError = await page3.$('text="工作台暂时无法加载"');

    const unauthPass = (isRedirectedToLogin || !!hasLoginPrompt) && !hasLoadError;
    
    results.push({
      id: "TS-WORKSPACE-TEMPLATES-UNAUTH-HANDLED",
      name: "/workspace/templates unauth handled",
      status: unauthPass ? "PASS" : "FAIL",
      severity: "P0",
      message: unauthPass
        ? isRedirectedToLogin ? "Redirected to login" : "Shows login prompt"
        : hasLoadError ? "Shows '工作台暂时无法加载'" : "No login prompt or redirect",
      evidence: `${EVIDENCE_DIR}/workspace-templates-unauth.png`,
    });

    await page3.screenshot({ path: `${EVIDENCE_DIR}/workspace-templates-unauth.png`, fullPage: false });
    await page3.close();
    await unauthContext3.close();

    // ============================================================
    // TEST 4: /workspace/templates auth loads (authenticated)
    // ============================================================
    console.log("\n=== TEST 4: /workspace/templates (authenticated) ===");
    const authContext4 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const loggedIn4 = await loginInContext(authContext4);
    
    if (!loggedIn4) {
      results.push({
        id: "TS-WORKSPACE-TEMPLATES-AUTH-LOADS",
        name: "/workspace/templates auth loads",
        status: "BLOCKED",
        severity: "P0",
        message: "Cannot login to test",
      });
    } else {
      const page4 = await authContext4.newPage();
      await page4.goto(`${BASE_URL}/workspace/templates`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page4.waitForTimeout(3000);

      const error = await hasErrorMessage(page4);
      const hasTitle = await page4.$('h1:has-text("我的模板")');
      const hasTemplatesPage = await page4.$('[data-testid="workspace-templates-page"]');

      const authPass = !error && hasTitle && hasTemplatesPage;
      
      results.push({
        id: "TS-WORKSPACE-TEMPLATES-AUTH-LOADS",
        name: "/workspace/templates auth loads",
        status: authPass ? "PASS" : "FAIL",
        severity: "P0",
        message: authPass
          ? "Page loaded with title '我的模板'"
          : error ? `Error found: ${error}` : `Missing: title=${!!hasTitle}, page=${!!hasTemplatesPage}`,
        evidence: `${EVIDENCE_DIR}/workspace-templates-auth.png`,
      });

      await page4.screenshot({ path: `${EVIDENCE_DIR}/workspace-templates-auth.png`, fullPage: false });
      await page4.close();

      // ============================================================
      // TEST 5: Saved canvas appears in templates (authenticated, same context)
      // ============================================================
      console.log("\n=== TEST 5: Save canvas and verify in templates ===");
      const page5 = await authContext4.newPage();
      await page5.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page5.waitForTimeout(3000);

      // Add a text element
      const addTextBtn = await page5.$('button:has-text("文本"), button:has-text("添加文本")');
      if (addTextBtn) {
        await addTextBtn.click();
        await page5.waitForTimeout(1000);
      }

      // Save the template
      const saveBtn = await page5.$('[data-testid="canvas-save-button"]');
      if (saveBtn) {
        await saveBtn.click();
        await page5.waitForTimeout(3000);

        // Check for "查看我的模板" link
        const viewMyTemplatesLink = await page5.$('a:has-text("查看我的模板"), a:has-text("我的模板")');
        
        if (viewMyTemplatesLink) {
          await viewMyTemplatesLink.click();
          await page5.waitForLoadState("domcontentloaded", { timeout: 30000 });
          await page5.waitForTimeout(3000);

          // Check if the template appears in the list
          const hasTemplateCard = await page5.$('[data-testid^="workspace-template-card-"]');
          
          results.push({
            id: "TS-SAVED-CANVAS-APPEARS-IN-TEMPLATES",
            name: "Saved canvas appears in templates",
            status: hasTemplateCard ? "PASS" : "FAIL",
            severity: "P0",
            message: hasTemplateCard ? "Saved template appears in list" : "Template not found in list",
            evidence: `${EVIDENCE_DIR}/saved-template-in-list.png`,
          });

          await page5.screenshot({ path: `${EVIDENCE_DIR}/saved-template-in-list.png`, fullPage: false });

          // ============================================================
          // TEST 6: Template edit link doesn't crash
          // ============================================================
          console.log("\n=== TEST 6: Template edit link ===");
          const editLink = await page5.$('a:has-text("编辑")');
          if (editLink) {
            await editLink.click();
            await page5.waitForLoadState("domcontentloaded", { timeout: 30000 });
            await page5.waitForTimeout(3000);

            const editError = await hasErrorMessage(page5);
            const hasEditor = await page5.$('[data-testid="canvas-editor-root"], [data-testid="template-studio-edit"], [data-testid="template-studio-editor"], h1:has-text("编辑")');

            const editPass = !editError && hasEditor;
            
            results.push({
              id: "TS-TEMPLATE-EDIT-LINK-NO-CRASH",
              name: "Template edit link doesn't crash",
              status: editPass ? "PASS" : "FAIL",
              severity: "P0",
              message: editPass
                ? "Edit page loaded successfully"
                : editError ? `Error found: ${editError}` : "Editor not found",
              evidence: `${EVIDENCE_DIR}/template-edit.png`,
            });

            await page5.screenshot({ path: `${EVIDENCE_DIR}/template-edit.png`, fullPage: false });
          } else {
            results.push({
              id: "TS-TEMPLATE-EDIT-LINK-NO-CRASH",
              name: "Template edit link doesn't crash",
              status: "BLOCKED",
              severity: "P0",
              message: "No edit link found",
            });
          }
        } else {
          results.push({
            id: "TS-SAVED-CANVAS-APPEARS-IN-TEMPLATES",
            name: "Saved canvas appears in templates",
            status: "FAIL",
            severity: "P0",
            message: "No '查看我的模板' link after save",
          });
          results.push({
            id: "TS-TEMPLATE-EDIT-LINK-NO-CRASH",
            name: "Template edit link doesn't crash",
            status: "BLOCKED",
            severity: "P0",
            message: "Cannot test - no template saved",
          });
        }
      } else {
        results.push({
          id: "TS-SAVED-CANVAS-APPEARS-IN-TEMPLATES",
          name: "Saved canvas appears in templates",
          status: "BLOCKED",
          severity: "P0",
          message: "No save button found",
        });
        results.push({
          id: "TS-TEMPLATE-EDIT-LINK-NO-CRASH",
          name: "Template edit link doesn't crash",
          status: "BLOCKED",
          severity: "P0",
          message: "Cannot test - no template saved",
        });
      }
      await page5.close();
    }
    await authContext4.close();

    // ============================================================
    // TEST 7: CTA mobile doesn't break (unauthenticated)
    // ============================================================
    console.log("\n=== TEST 7: CTA mobile (unauthenticated) ===");
    const unauthContext7 = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page7 = await unauthContext7.newPage();
    
    await page7.goto(`${BASE_URL}/tools`, { waitUntil: "networkidle", timeout: 60000 });
    await page7.waitForTimeout(2000);

    const ctaContainer = await page7.$('.flex.items-center.gap-2.flex-wrap');
    const hasOverflow = await page7.evaluate(() => {
      const container = document.querySelector('.flex.items-center.gap-2.flex-wrap');
      if (!container) return false;
      const rect = container.getBoundingClientRect();
      return rect.width > window.innerWidth;
    });

    const mobilePass = !!ctaContainer && !hasOverflow;
    
    results.push({
      id: "TS-CTA-MOBILE-NO-BREAK",
      name: "CTA mobile doesn't break",
      status: mobilePass ? "PASS" : "FAIL",
      severity: "P1",
      message: mobilePass
        ? "CTA container wraps correctly on mobile"
        : hasOverflow ? "CTA overflows on mobile" : "CTA container not found",
      evidence: `${EVIDENCE_DIR}/tools-mobile.png`,
    });

    await page7.screenshot({ path: `${EVIDENCE_DIR}/tools-mobile.png`, fullPage: false });
    await page7.close();
    await unauthContext7.close();

    // Cleanup
    await browser.close();

  } catch (err) {
    console.error("Audit error:", err);
    results.push({
      id: "AUDIT-ERROR",
      name: "Audit execution error",
      status: "BLOCKED",
      severity: "P0",
      message: String(err),
    });
    if (browser) await browser.close();
  }

  return results;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Template Routes Runtime Audit v2 ===");
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log("");

  const results = await runAudit();

  // Print summary
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  const blocked = results.filter(r => r.status === "BLOCKED").length;

  console.log("\n=== RESULTS ===");
  for (const r of results) {
    const icon = r.status === "PASS" ? "✅" : r.status === "FAIL" ? "❌" : "⛔";
    console.log(`${icon} [${r.id}] ${r.name}: ${r.status} — ${r.message}`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`PASS: ${passed} / ${results.length}`);
  console.log(`FAIL: ${failed} / ${results.length}`);
  console.log(`BLOCKED: ${blocked} / ${results.length}`);
  console.log(`Evidence: ${EVIDENCE_DIR}`);

  // Write results JSON
  fs.writeFileSync(
    path.join(EVIDENCE_DIR, "results.json"),
    JSON.stringify({ results, summary: { passed, failed, blocked, total: results.length } }, null, 2)
  );

  // Exit code
  if (failed > 0 || blocked > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
