#!/usr/bin/env tsx
/**
 * Template Routes Runtime Audit
 * v1.20.42.18.6.16.6.30
 *
 * Tests template routes runtime behavior:
 * - /tools has real CTA banner
 * - /tools/template-studio loads
 * - /workspace/templates handles unauth
 * - /workspace/templates loads when authed
 * - Saved canvas appears in templates
 * - Edit link doesn't crash
 * - Mobile CTA doesn't break
 */

import { chromium, type Page, type Browser } from "playwright";
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
// Helper: Login
// ============================================================

async function login(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', TEST_EMAIL);
    const pwd = fs.readFileSync(TEST_PASSWORD_FILE, "utf-8").trim();
    await page.fill('input[type="password"]', pwd);
    try {
      const cookieBtn = await page.$('button:has-text("Accept"), button:has-text("接受")');
      if (cookieBtn) await cookieBtn.click();
    } catch { /* ignore */ }
    await page.click('button[type="submit"]');
    await page.waitForURL("**/tools**", { timeout: 15000 });
    return true;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  }
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
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    // ============================================================
    // TEST 1: /tools has real CTA banner
    // ============================================================
    await page.goto(`${BASE_URL}/tools`, { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
    await page.waitForTimeout(2000);

    const hasBannerTitle = await page.$('h1:has-text("工具中心"), h2:has-text("工具中心")');
    const hasBannerSubtitle = await page.$('p:has-text("实用工具"), p:has-text("出海")');
    const hasDocumentsCTA = await page.$('a[href="/tools/documents"]');
    const hasTemplateStudioCTA = await page.$('a[href="/tools/template-studio"]');
    const hasMyTemplatesCTA = await page.$('a[href="/workspace/templates"]');

    results.push({
      id: "TS-TOOLS-HAS-REAL-CTA-BANNER",
      name: "/tools has real CTA banner",
      status: hasBannerTitle && hasBannerSubtitle && hasDocumentsCTA && hasTemplateStudioCTA && hasMyTemplatesCTA ? "PASS" : "FAIL",
      severity: "P0",
      message: hasBannerTitle && hasBannerSubtitle && hasDocumentsCTA && hasTemplateStudioCTA && hasMyTemplatesCTA
        ? "Banner with title, subtitle, and 3 CTAs found"
        : `Banner incomplete: title=${!!hasBannerTitle}, subtitle=${!!hasBannerSubtitle}, docs=${!!hasDocumentsCTA}, studio=${!!hasTemplateStudioCTA}, templates=${!!hasMyTemplatesCTA}`,
      evidence: `${EVIDENCE_DIR}/tools-banner.png`,
    });

    await page.screenshot({ path: `${EVIDENCE_DIR}/tools-banner.png`, fullPage: false });

    // ============================================================
    // TEST 2: /tools/template-studio loads
    // ============================================================
    // Login first since this page requires auth
    const loggedInForTest2 = await login(page);
    if (!loggedInForTest2) {
      results.push({
        id: "TS-TEMPLATE-STUDIO-PAGE-LOADS",
        name: "/tools/template-studio loads",
        status: "BLOCKED",
        severity: "P0",
        message: "Cannot login to test",
      });
    } else {
      await page.goto(`${BASE_URL}/tools/template-studio`, { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
      await page.waitForTimeout(3000);

      const hasStartDesign = await page.$('a:has-text("开始设计"), button:has-text("开始设计")');
      const hasMyTemplates = await page.$('a:has-text("我的模板")');
      const hasError = await page.$('text="this page couldn\'t load"');

      results.push({
        id: "TS-TEMPLATE-STUDIO-PAGE-LOADS",
        name: "/tools/template-studio loads",
        status: !hasError && hasStartDesign && hasMyTemplates ? "PASS" : "FAIL",
        severity: "P0",
        message: !hasError && hasStartDesign && hasMyTemplates
          ? "Page loaded with '开始设计' and '我的模板'"
          : hasError ? "Page shows 'this page couldn't load'" : `Missing: startDesign=${!!hasStartDesign}, myTemplates=${!!hasMyTemplates}`,
        evidence: `${EVIDENCE_DIR}/template-studio.png`,
      });

      await page.screenshot({ path: `${EVIDENCE_DIR}/template-studio.png`, fullPage: false });
    }

    // ============================================================
    // TEST 3: /workspace/templates unauth handled
    // ============================================================
    // Clear cookies to simulate unauth
    await context.clearCookies();
    await page.goto(`${BASE_URL}/workspace/templates`, { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const isRedirectedToLogin = currentUrl.includes("/login");
    const hasLoginPrompt = await page.$('input[type="email"]') || await page.$('input[type="password"]') || await page.$('text="请先登录"');
    const hasLoadError = await page.$('text="工作台暂时无法加载"');

    results.push({
      id: "TS-WORKSPACE-TEMPLATES-UNAUTH-HANDLED",
      name: "/workspace/templates unauth handled",
      status: (isRedirectedToLogin || hasLoginPrompt) && !hasLoadError ? "PASS" : "FAIL",
      severity: "P0",
      message: (isRedirectedToLogin || hasLoginPrompt) && !hasLoadError
        ? isRedirectedToLogin ? "Redirected to login" : "Shows login prompt"
        : hasLoadError ? "Shows '工作台暂时无法加载'" : "No login prompt or redirect",
      evidence: `${EVIDENCE_DIR}/workspace-templates-unauth.png`,
    });

    await page.screenshot({ path: `${EVIDENCE_DIR}/workspace-templates-unauth.png`, fullPage: false });

    // ============================================================
    // TEST 4: /workspace/templates auth loads
    // ============================================================
    const loggedIn = await login(page);
    if (!loggedIn) {
      results.push({
        id: "TS-WORKSPACE-TEMPLATES-AUTH-LOADS",
        name: "/workspace/templates auth loads",
        status: "BLOCKED",
        severity: "P0",
        message: "Cannot login to test",
      });
    } else {
      await page.goto(`${BASE_URL}/workspace/templates`, { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
      await page.waitForTimeout(3000);

      const hasTitle = await page.$('h1:has-text("我的模板")');
      const hasLoadError2 = await page.$('text="工作台暂时无法加载"');

      results.push({
        id: "TS-WORKSPACE-TEMPLATES-AUTH-LOADS",
        name: "/workspace/templates auth loads",
        status: hasTitle && !hasLoadError2 ? "PASS" : "FAIL",
        severity: "P0",
        message: hasTitle && !hasLoadError2
          ? "Page loaded with title '我的模板'"
          : hasLoadError2 ? "Shows '工作台暂时无法加载'" : "No title found",
        evidence: `${EVIDENCE_DIR}/workspace-templates-auth.png`,
      });

      await page.screenshot({ path: `${EVIDENCE_DIR}/workspace-templates-auth.png`, fullPage: false });

      // ============================================================
      // TEST 5: Saved canvas appears in templates
      // ============================================================
      // Go to canvas editor and save a template
      await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { timeout: 60000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
      await page.waitForTimeout(3000);

      // Add a text element
      const addTextBtn = await page.$('button:has-text("文本"), button:has-text("添加文本")');
      if (addTextBtn) {
        await addTextBtn.click();
        await page.waitForTimeout(1000);
      }

      // Save the template
      const saveBtn = await page.$('[data-testid="canvas-save-button"]');
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(3000);

        // Check for "查看我的模板" link
        const viewMyTemplatesLink = await page.$('a:has-text("查看我的模板"), a:has-text("我的模板")');
        
        if (viewMyTemplatesLink) {
          await viewMyTemplatesLink.click();
          await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
          await page.waitForTimeout(3000);

          // Check if the template appears in the list
          const hasTemplateCard = await page.$('[data-testid^="workspace-template-card-"]');
          
          results.push({
            id: "TS-SAVED-CANVAS-APPEARS-IN-TEMPLATES",
            name: "Saved canvas appears in templates",
            status: hasTemplateCard ? "PASS" : "FAIL",
            severity: "P0",
            message: hasTemplateCard ? "Saved template appears in list" : "Template not found in list",
            evidence: `${EVIDENCE_DIR}/saved-template-in-list.png`,
          });

          await page.screenshot({ path: `${EVIDENCE_DIR}/saved-template-in-list.png`, fullPage: false });

          // ============================================================
          // TEST 6: Template edit link doesn't crash
          // ============================================================
          const editLink = await page.$('a:has-text("编辑")');
          if (editLink) {
            await editLink.click();
            await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
            await page.waitForTimeout(3000);

            const hasEditError = await page.$('text="this page couldn\'t load"');
            const hasEditor = await page.$('[data-testid="canvas-editor-root"], [data-testid="template-studio-edit"]');

            results.push({
              id: "TS-TEMPLATE-EDIT-LINK-NO-CRASH",
              name: "Template edit link doesn't crash",
              status: !hasEditError && hasEditor ? "PASS" : "FAIL",
              severity: "P0",
              message: !hasEditError && hasEditor
                ? "Edit page loaded successfully"
                : hasEditError ? "Page shows 'this page couldn't load'" : "Editor not found",
              evidence: `${EVIDENCE_DIR}/template-edit.png`,
            });

            await page.screenshot({ path: `${EVIDENCE_DIR}/template-edit.png`, fullPage: false });
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
    }

    // ============================================================
    // TEST 7: CTA mobile doesn't break
    // ============================================================
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/tools`, { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded", { timeout: 60000 });
    await page.waitForTimeout(2000);

    const ctaContainer = await page.$('.flex.items-center.gap-2.flex-wrap');
    const hasOverflow = await page.evaluate(() => {
      const container = document.querySelector('.flex.items-center.gap-2.flex-wrap');
      if (!container) return false;
      const rect = container.getBoundingClientRect();
      return rect.width > window.innerWidth;
    });

    results.push({
      id: "TS-CTA-MOBILE-NO-BREAK",
      name: "CTA mobile doesn't break",
      status: ctaContainer && !hasOverflow ? "PASS" : "FAIL",
      severity: "P1",
      message: ctaContainer && !hasOverflow
        ? "CTA container wraps correctly on mobile"
        : hasOverflow ? "CTA overflows on mobile" : "CTA container not found",
      evidence: `${EVIDENCE_DIR}/tools-mobile.png`,
    });

    await page.screenshot({ path: `${EVIDENCE_DIR}/tools-mobile.png`, fullPage: false });

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
  console.log("=== Template Routes Runtime Audit ===");
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
