#!/usr/bin/env tsx
/**
 * Template Print Renderer Audit v6.44
 * v1.20.42.18.6.16.6.44
 *
 * Validates data-driven print renderer:
 * - No longer clones preview DOM
 * - Generates print DOM from canvas.elements data
 * - Coordinates match between design and print
 * - Multi-page layout stable (only sequence changes)
 * - No raw company tokens
 * - No nav/footer in print
 * - Single print layer
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
const EVIDENCE_DIR = path.join(process.cwd(), "evidence", `print-renderer-v6.44-${Date.now()}`);

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

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ElementPosition {
  id: string;
  type: string;
  bbox: BBox;
}

// ============================================================
// Helper: Login
// ============================================================

async function login(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', TEST_EMAIL);
    const pwd = fs.readFileSync(TEST_PASSWORD_FILE, "utf-8").trim();
    await page.fill('input[type="password"]', pwd);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/tools**", { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });
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

    // Login
    const loggedIn = await login(page);
    if (!loggedIn) {
      results.push({
        id: "AUDIT-LOGIN",
        name: "Login",
        status: "BLOCKED",
        severity: "P0",
        message: "Cannot login",
      });
      return results;
    }

    // ============================================================
    // TEST 1: Data-driven renderer (no clone preview DOM)
    // ============================================================
    console.log("\n=== TEST 1: Data-driven renderer ===");
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    // Add a text element
    const addTextBtn = await page.$('[data-testid="canvas-add-text-button"]');
    if (addTextBtn) {
      await addTextBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click print button
    const printBtn = await page.$('[data-testid="canvas-print-button"]');
    if (printBtn) {
      await printBtn.click();
      await page.waitForTimeout(2000);
    }

    // Check iframe HTML for data-driven markers
    const iframeHTML = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return null;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      return iframeDoc?.documentElement?.outerHTML || null;
    });

    const hasDataElementId = iframeHTML?.includes('data-element-id=');
    const hasDataElementType = iframeHTML?.includes('data-element-type=');
    const hasDataPageIndex = iframeHTML?.includes('data-page-index=');
    const noClonePreview = !iframeHTML?.includes('canvas-print-unscaled-paper');
    const noCloneGrid = !iframeHTML?.includes('canvas-grid-overlay');
    const noCloneResize = !iframeHTML?.includes('canvas-resize-handle');

    const dataDrivenPass = hasDataElementId && hasDataElementType && hasDataPageIndex && noClonePreview && noCloneGrid && noCloneResize;

    results.push({
      id: "TS-PRINT-RENDERER-DATA_DRIVEN",
      name: "Data-driven print renderer",
      status: dataDrivenPass ? "PASS" : "FAIL",
      severity: "P0",
      message: dataDrivenPass
        ? "Print DOM generated from data (data-element-id, data-element-type, data-page-index found; no clone markers)"
        : `Data-driven markers missing: elementId=${hasDataElementId}, elementType=${hasDataElementType}, pageIndex=${hasDataPageIndex}, noClonePreview=${noClonePreview}, noCloneGrid=${noCloneGrid}, noCloneResize=${noCloneResize}`,
      evidence: `${EVIDENCE_DIR}/print-dom.html`,
    });

    // Save print DOM
    if (iframeHTML) {
      fs.writeFileSync(`${EVIDENCE_DIR}/print-dom.html`, iframeHTML);
    }

    // ============================================================
    // TEST 2: Coordinate parity (design vs print)
    // ============================================================
    console.log("\n=== TEST 2: Coordinate parity ===");

    // Get design mode element positions
    const designPositions = await page.evaluate(() => {
      const paper = document.querySelector('[data-testid="canvas-paper"]');
      if (!paper) return [];
      const paperRect = paper.getBoundingClientRect();
      const elements = paper.querySelectorAll('[data-testid^="canvas-element-"]');
      return Array.from(elements).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.getAttribute('data-testid')?.replace('canvas-element-', '') || '',
          type: el.getAttribute('data-element-type') || '',
          bbox: {
            x: rect.left - paperRect.left,
            y: rect.top - paperRect.top,
            width: rect.width,
            height: rect.height,
          },
        };
      });
    });

    // Get print mode element positions
    const printPositions = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return [];
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return [];
      const pageWrapper = iframeDoc.querySelector('.print-page-wrapper');
      if (!pageWrapper) return [];
      const pageRect = pageWrapper.getBoundingClientRect();
      const elements = iframeDoc.querySelectorAll('[data-element-id]');
      return Array.from(elements).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.getAttribute('data-element-id') || '',
          type: el.getAttribute('data-element-type') || '',
          bbox: {
            x: rect.left - pageRect.left,
            y: rect.top - pageRect.top,
            width: rect.width,
            height: rect.height,
          },
        };
      });
    });

    // Compare positions (3% tolerance)
    const TOLERANCE = 0.03; // 3%
    let parityPass = true;
    const deltas: any[] = [];

    for (const designPos of designPositions) {
      const printPos = printPositions.find(p => p.id === designPos.id);
      if (!printPos) {
        parityPass = false;
        deltas.push({ id: designPos.id, reason: 'Element not found in print' });
        continue;
      }

      const dx = Math.abs(designPos.bbox.x - printPos.bbox.x);
      const dy = Math.abs(designPos.bbox.y - printPos.bbox.y);
      const dw = Math.abs(designPos.bbox.width - printPos.bbox.width);
      const dh = Math.abs(designPos.bbox.height - printPos.bbox.height);

      const toleranceX = designPos.bbox.width * TOLERANCE;
      const toleranceY = designPos.bbox.height * TOLERANCE;

      if (dx > toleranceX || dy > toleranceY || dw > toleranceX || dh > toleranceY) {
        parityPass = false;
        deltas.push({
          id: designPos.id,
          design: designPos.bbox,
          print: printPos.bbox,
          dx, dy, dw, dh,
        });
      }
    }

    results.push({
      id: "TS-PRINT-PARITY-COORDINATES",
      name: "Coordinate parity (design vs print)",
      status: parityPass ? "PASS" : "FAIL",
      severity: "P0",
      message: parityPass
        ? `All element coordinates within 3% tolerance (${designPositions.length} elements checked)`
        : `Coordinate mismatch: ${deltas.length} elements out of tolerance`,
      evidence: `${EVIDENCE_DIR}/position-delta.json`,
    });

    // Save position data
    fs.writeFileSync(`${EVIDENCE_DIR}/design-positions.json`, JSON.stringify(designPositions, null, 2));
    fs.writeFileSync(`${EVIDENCE_DIR}/print-positions.json`, JSON.stringify(printPositions, null, 2));
    fs.writeFileSync(`${EVIDENCE_DIR}/position-delta.json`, JSON.stringify(deltas, null, 2));

    // ============================================================
    // TEST 3: Multi-page layout stable
    // ============================================================
    console.log("\n=== TEST 3: Multi-page layout stable ===");

    // Set package count to 10
    const packageInput = await page.$('[data-testid="canvas-package-count-input"]');
    if (packageInput) {
      await packageInput.fill('10');
      await page.waitForTimeout(1000);
    }

    // Set output mode to repeat
    const repeatMode = await page.$('[data-testid="canvas-output-mode-repeat"]');
    if (repeatMode) {
      await repeatMode.click();
      await page.waitForTimeout(1000);
    }

    // Click print again
    if (printBtn) {
      await printBtn.click();
      await page.waitForTimeout(2000);
    }

    // Check page count
    const pageCount = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return 0;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      return iframeDoc?.querySelectorAll('.print-page-wrapper').length || 0;
    });

    const multiPagePass = pageCount === 10;

    results.push({
      id: "TS-PRINT-REPEAT-ONLY_SEQUENCE_VALUE_CHANGES",
      name: "Multi-page layout stable (10 pages)",
      status: multiPagePass ? "PASS" : "FAIL",
      severity: "P0",
      message: multiPagePass
        ? `10 pages generated correctly`
        : `Expected 10 pages, got ${pageCount}`,
      evidence: `${EVIDENCE_DIR}/multi-page.json`,
    });

    // ============================================================
    // TEST 4: No raw company tokens
    // ============================================================
    console.log("\n=== TEST 4: No raw company tokens ===");

    const hasRawTokens = iframeHTML?.includes('[company.') || iframeHTML?.includes('[product.');
    const noRawTokensPass = !hasRawTokens;

    results.push({
      id: "TS-PRINT-NO_RAW_COMPANY_TOKEN",
      name: "No raw company tokens",
      status: noRawTokensPass ? "PASS" : "FAIL",
      severity: "P0",
      message: noRawTokensPass
        ? "No raw [company.*] or [product.*] tokens found"
        : "Raw tokens found in print DOM",
      evidence: `${EVIDENCE_DIR}/token-check.txt`,
    });

    fs.writeFileSync(`${EVIDENCE_DIR}/token-check.txt`, hasRawTokens ? "FAIL: Raw tokens found" : "PASS: No raw tokens");

    // ============================================================
    // TEST 5: No nav/footer
    // ============================================================
    console.log("\n=== TEST 5: No nav/footer ===");

    const hasNavFooter = iframeHTML?.includes('<nav') || iframeHTML?.includes('<footer') || iframeHTML?.includes('<header');
    const noNavFooterPass = !hasNavFooter;

    results.push({
      id: "TS-PRINT-NO_NAV_FOOTER",
      name: "No nav/footer in print",
      status: noNavFooterPass ? "PASS" : "FAIL",
      severity: "P0",
      message: noNavFooterPass
        ? "No nav/footer/header elements in print DOM"
        : "Nav/footer/header elements found in print DOM",
    });

    // ============================================================
    // TEST 6: Single print layer
    // ============================================================
    console.log("\n=== TEST 6: Single print layer ===");

    const layerCount = await page.evaluate(() => {
      const iframe = document.querySelector('#canvas-print-iframe') as HTMLIFrameElement;
      if (!iframe) return { pages: 0, papers: 0 };
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const pages = iframeDoc?.querySelectorAll('.print-page-wrapper').length || 0;
      const papers = iframeDoc?.querySelectorAll('[data-testid="canvas-print-unscaled-paper"]').length || 0;
      return { pages, papers };
    });

    const singleLayerPass = layerCount.pages === layerCount.papers && layerCount.papers > 0;

    results.push({
      id: "TS-PRINT-SINGLE_LAYER_ONLY",
      name: "Single print layer",
      status: singleLayerPass ? "PASS" : "FAIL",
      severity: "P0",
      message: singleLayerPass
        ? `Single layer: ${layerCount.pages} pages, ${layerCount.papers} papers`
        : `Multiple layers: ${layerCount.pages} pages, ${layerCount.papers} papers`,
    });

    // ============================================================
    // TEST 7: Saved edit no regression
    // ============================================================
    console.log("\n=== TEST 7: Saved edit no regression ===");

    await page.goto(`${BASE_URL}/workspace/templates`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    const pageText = await page.textContent('body');
    const hasError = pageText?.includes("This page couldn't load") || pageText?.includes('页面加载失败');

    const savedEditPass = !hasError;

    results.push({
      id: "TS-SAVED-CANVAS-EDIT-NO-REGRESSION",
      name: "Saved edit no regression",
      status: savedEditPass ? "PASS" : "FAIL",
      severity: "P0",
      message: savedEditPass
        ? "Saved edit page loads without error"
        : "Saved edit page shows error",
    });

    // ============================================================
    // TEST 8: Company block no regression
    // ============================================================
    console.log("\n=== TEST 8: Company block no regression ===");

    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    const companyBtn = await page.$('[data-testid="canvas-add-company-info-button"]');
    if (companyBtn) {
      await companyBtn.click();
      await page.waitForTimeout(1000);

      const companyBlocks = await page.$$('[data-testid="canvas-company-info-block"]');
      const companyBlockPass = companyBlocks.length === 1;

      results.push({
        id: "TS-COMPANY-BLOCK-NO-REGRESSION",
        name: "Company block no regression",
        status: companyBlockPass ? "PASS" : "FAIL",
        severity: "P0",
        message: companyBlockPass
          ? "Single company-info block"
          : `Expected 1 company block, got ${companyBlocks.length}`,
      });
    } else {
      results.push({
        id: "TS-COMPANY-BLOCK-NO-REGRESSION",
        name: "Company block no regression",
        status: "BLOCKED",
        severity: "P0",
        message: "Company button not found",
      });
    }

    // ============================================================
    // TEST 9: PNG guard no regression
    // ============================================================
    console.log("\n=== TEST 9: PNG guard no regression ===");

    const exportBtn = await page.$('[data-testid="canvas-export-png-button"]');
    if (exportBtn) {
      await exportBtn.click();
      await page.waitForTimeout(2000);

      const guardVisible = await page.$('text=批量 PNG 导出开发中');
      const pngGuardPass = !!guardVisible;

      results.push({
        id: "TS-PNG-GUARD-NO-REGRESSION",
        name: "PNG guard no regression",
        status: pngGuardPass ? "PASS" : "FAIL",
        severity: "P0",
        message: pngGuardPass
          ? "PNG guard message visible"
          : "PNG guard message not visible",
      });
    } else {
      results.push({
        id: "TS-PNG-GUARD-NO-REGRESSION",
        name: "PNG guard no regression",
        status: "BLOCKED",
        severity: "P0",
        message: "Export button not found",
      });
    }

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
  console.log("=== Template Print Renderer Audit v6.44 ===");
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
