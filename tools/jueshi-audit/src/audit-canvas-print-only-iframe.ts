#!/usr/bin/env tsx
/**
 * Canvas Print-Only Iframe Audit
 * v1.20.42.18.6.16.6.23
 *
 * Verifies:
 * 1. Print button triggers iframe creation (not window.print)
 * 2. iframe contains only canvas pages (no header/footer/nav)
 * 3. packageCount=10 produces 10 pages
 * 4. Page sequences are correct (1/10 ... 10/10)
 * 5. No forbidden elements in print output
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
const EVIDENCE_DIR = path.join(process.cwd(), "evidence", `print-only-iframe-${Date.now()}`);

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

    // Login
    const loggedIn = await login(page);
    if (!loggedIn) {
      results.push({
        id: "PRINT-000",
        name: "Login",
        status: "BLOCKED",
        severity: "P0",
        message: "Cannot login to staging",
      });
      return results;
    }
    console.log("✓ Logged in");

    // Navigate to canvas editor
    await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`);
    await page.waitForSelector('[data-testid="canvas-editor-root"]', { timeout: 15000 });
    console.log("✓ Canvas editor loaded");

    // ============================================================
    // TEST 1: Print button exists
    // ============================================================
    const printBtn = await page.$('[data-testid="canvas-print-button"]');
    results.push({
      id: "PRINT-001",
      name: "Print button exists",
      status: printBtn ? "PASS" : "FAIL",
      severity: "P0",
      message: printBtn ? "Print button found" : "Print button not found",
    });

    // ============================================================
    // TEST 2: Set batch config — packageCount=10, outputMode=repeat
    // ============================================================
    // Enable batch mode
    const batchToggle = await page.$('[data-testid="canvas-show-sequence"]');
    if (batchToggle) {
      const isChecked = await batchToggle.isChecked();
      if (!isChecked) await batchToggle.click();
    }

    // Set output mode to repeat
    const outputModeSelect = await page.$('select[data-testid="canvas-output-mode"]');
    if (outputModeSelect) {
      await outputModeSelect.selectOption("repeat");
    }

    // Set packageCount to 10
    const packageCountInput = await page.$('input[data-testid="canvas-package-count"]');
    if (packageCountInput) {
      await packageCountInput.fill("10");
      await packageCountInput.press("Tab");
    }

    await page.waitForTimeout(1000);

    // ============================================================
    // TEST 3: Verify 10 canvas-print-page elements exist
    // ============================================================
    const printPages = await page.$$('[data-testid="canvas-print-page"]');
    const pageCount = printPages.length;
    results.push({
      id: "PRINT-002",
      name: "10 print pages rendered",
      status: pageCount === 10 ? "PASS" : "FAIL",
      severity: "P0",
      message: `Found ${pageCount} canvas-print-page elements (expected 10)`,
    });

    // ============================================================
    // TEST 4: Verify sequence elements — page 1 shows 1/10, page 10 shows 10/10
    // ============================================================
    const page1Seq = await page.$('[data-testid="canvas-page-1-sequence"]');
    const page10Seq = await page.$('[data-testid="canvas-page-10-sequence"]');
    
    let page1Text = "";
    let page10Text = "";
    if (page1Seq) page1Text = await page1Seq.textContent() || "";
    if (page10Seq) page10Text = await page10Seq.textContent() || "";

    results.push({
      id: "PRINT-003",
      name: "Page 1 sequence shows 1/10",
      status: page1Text.includes("1/10") || page1Text.includes("1 of 10") ? "PASS" : "FAIL",
      severity: "P0",
      message: `Page 1 sequence text: "${page1Text}"`,
    });

    results.push({
      id: "PRINT-004",
      name: "Page 10 sequence shows 10/10",
      status: page10Text.includes("10/10") || page10Text.includes("10 of 10") ? "PASS" : "FAIL",
      severity: "P0",
      message: `Page 10 sequence text: "${page10Text}"`,
    });

    // ============================================================
    // TEST 5: Click print button — verify iframe is created (not window.print)
    // ============================================================
    
    // Listen for dialog events (window.print would trigger a dialog in some browsers)
    let dialogTriggered = false;
    page.on("dialog", async (dialog) => {
      dialogTriggered = true;
      await dialog.dismiss();
    });

    // Click print button
    await printBtn!.click();
    await page.waitForTimeout(2000);

    // Check if iframe was created
    const iframe = await page.$("#canvas-print-iframe");
    results.push({
      id: "PRINT-005",
      name: "Print iframe created (not window.print)",
      status: iframe ? "PASS" : "FAIL",
      severity: "P0",
      message: iframe 
        ? "iframe#print-only created — print is isolated from site layout" 
        : "No iframe found — may still be using window.print()",
    });

    // ============================================================
    // TEST 6: Verify iframe contains canvas pages
    // ============================================================
    if (iframe) {
      const iframeContent = await iframe.contentFrame();
      if (iframeContent) {
        const iframePages = await iframeContent.$$('[data-testid="canvas-print-page"]');
        const iframePageCount = iframePages.length;
        
        results.push({
          id: "PRINT-006",
          name: "Iframe contains 10 canvas pages",
          status: iframePageCount === 10 ? "PASS" : "FAIL",
          severity: "P0",
          message: `Iframe contains ${iframePageCount} canvas-print-page elements (expected 10)`,
        });

        // ============================================================
        // TEST 7: Verify NO forbidden elements in iframe
        // ============================================================
        const forbiddenTests = [
          { selector: "footer", name: "No footer in iframe" },
          { selector: "nav", name: "No nav in iframe" },
          { selector: "header", name: "No header in iframe" },
          { selector: '[data-testid="canvas-toggle-left-panel"]', name: "No left panel toggle" },
          { selector: '[data-testid="canvas-toggle-right-panel"]', name: "No right panel toggle" },
          { selector: '[data-testid="canvas-undo-button"]', name: "No undo button" },
          { selector: '[data-testid="canvas-redo-button"]', name: "No redo button" },
          { selector: '[data-testid="canvas-draft-restore-banner"]', name: "No draft restore banner" },
          { selector: '[data-testid="canvas-grid-overlay"]', name: "No grid overlay" },
          { selector: '[data-testid="canvas-print-page-count"]', name: "No page count indicator" },
          { selector: '[data-testid="canvas-print-page-sequence"]', name: "No page sequence indicator" },
          { selector: '[data-testid="canvas-resize-handle"]', name: "No resize handles" },
          { selector: '[data-testid="canvas-edit-text-button"]', name: "No edit text buttons" },
        ];

        for (const test of forbiddenTests) {
          const found = await iframeContent.$(test.selector);
          results.push({
            id: `PRINT-FORBIDDEN-${test.selector.replace(/[^a-zA-Z0-9]/g, "_")}`,
            name: test.name,
            status: found ? "FAIL" : "PASS",
            severity: "P0",
            message: found 
              ? `FORBIDDEN: ${test.selector} found in print iframe` 
              : `${test.name} — clean`,
          });
        }

        // ============================================================
        // TEST 8: Verify iframe sequences — no duplicates
        // ============================================================
        const iframeSequences = await iframeContent.$$('[data-testid="canvas-sequence-element"], [data-testid*="sequence"]');
        const seqTexts: string[] = [];
        for (const seq of iframeSequences) {
          const text = await seq.textContent() || "";
          if (text.match(/\d+\/\d+/) || text.match(/\d+ of \d+/)) {
            seqTexts.push(text.trim());
          }
        }
        
        // Check for duplicates
        const uniqueTexts = [...new Set(seqTexts)];
        results.push({
          id: "PRINT-007",
          name: "No duplicate sequences in iframe",
          status: seqTexts.length === uniqueTexts.length ? "PASS" : "FAIL",
          severity: "P0",
          message: `Found ${seqTexts.length} sequences, ${uniqueTexts.length} unique. Texts: ${seqTexts.join(", ")}`,
        });

        // Screenshot the iframe content (use the page screenshot as evidence)
        await page.screenshot({ 
          path: path.join(EVIDENCE_DIR, "iframe-print-content.png"),
          fullPage: false 
        });
      }
    }

    // ============================================================
    // TEST 9: Verify window.print is NOT called
    // ============================================================
    // Check source code for window.print()
    const pageSource = await page.content();
    const hasWindowPrint = pageSource.includes("window.print()");
    
    // Also check via JS evaluation — the handlePrint function should not call window.print
    const handlePrintSource = await page.evaluate(() => {
      // Try to find the print handler in the React fiber
      const printBtn = document.querySelector('[data-testid="canvas-print-button"]');
      if (printBtn) {
        const onClick = (printBtn as any).__reactFiber$?.memoizedProps?.onClick;
        return onClick ? onClick.toString() : "no onClick found";
      }
      return "no print button found";
    });
    
    const usesIframe = handlePrintSource.includes("iframe") || handlePrintSource.includes("createElement");
    results.push({
      id: "PRINT-008",
      name: "Print handler uses iframe (not window.print)",
      status: usesIframe ? "PASS" : "FAIL",
      severity: "P0",
      message: usesIframe 
        ? "Print handler creates iframe for isolated printing" 
        : `Print handler may still use window.print: ${handlePrintSource.substring(0, 100)}`,
    });

    // Screenshot the main page
    await page.screenshot({ 
      path: path.join(EVIDENCE_DIR, "canvas-editor-main-page.png"),
      fullPage: true 
    });

    // Cleanup
    await browser.close();

  } catch (err) {
    console.error("Audit error:", err);
    results.push({
      id: "PRINT-ERR",
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
  console.log("=== Canvas Print-Only Iframe Audit ===");
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
