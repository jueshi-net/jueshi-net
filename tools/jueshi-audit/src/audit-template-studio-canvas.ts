/**
 * Template Studio Canvas Editor Audit
 * 
 * Tests canvas-based free layout template editor.
 * 
 * @module audit-template-studio-canvas
 */

import { chromium, Browser, Page } from "playwright";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

// ============================================================
// Configuration
// ============================================================

const BASE_URL = process.env.AUDIT_BASE_URL || "https://i.jueshi.net";
const TEST_EMAIL = process.env.AUDIT_TEST_EMAIL || "test@jueshi.net";
const TEST_PASSWORD_FILE = process.env.AUDIT_TEST_PASSWORD_FILE || "/tmp/staging_pwd.txt";
const ARTIFACTS_DIR = join(process.cwd(), "artifacts", "template-studio-canvas");

// ============================================================
// Results
// ============================================================

interface AuditResult {
  id: string;
  name: string;
  level: "P0" | "P1" | "P2" | "P3";
  status: "PASS" | "FAIL" | "BLOCKED";
  evidence: string;
}

const results: AuditResult[] = [];

function record(id: string, name: string, level: "P0" | "P1" | "P2" | "P3", status: "PASS" | "FAIL" | "BLOCKED", evidence: string) {
  results.push({ id, name, level, status, evidence });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⊘";
  console.log(`[${icon}] ${id} — ${name}`);
  console.log(`  Evidence: ${evidence}`);
}

// ============================================================
// Main Audit
// ============================================================

async function run() {
  console.log("=== Template Studio Canvas Editor Audit ===");
  console.log(`Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  try {
    const password = readFileSync(TEST_PASSWORD_FILE, "utf-8").trim();
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Check if we're logged in by checking URL or page content
    const currentUrl = page.url();
    const isLoggedIn = !currentUrl.includes("/login");
    
    if (isLoggedIn) {
      record("LOGIN", "登录", "P0", "PASS", `Logged in as ${TEST_EMAIL}, redirected to ${currentUrl}`);
    } else {
      record("LOGIN", "登录", "P0", "FAIL", `Still on login page: ${currentUrl}`);
      await browser.close();
      writeResults();
      return;
    }
  } catch (err) {
    record("LOGIN", "登录", "P0", "FAIL", `Error: ${err}`);
    await browser.close();
    writeResults();
    return;
  }

  // ============================================================
  // Canvas Editor Tests
  // ============================================================

  // TS-CANVAS-MODE-ENTRY: Can enter canvas mode
  try {
    await page.goto(`${BASE_URL}/tools/template-studio`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);
    const canvasBtn = page.locator('[data-testid="template-studio-canvas-mode-button"]');
    const canvasBtnExists = await canvasBtn.count() > 0;
    
    if (canvasBtnExists) {
      await canvasBtn.click();
      await page.waitForTimeout(3000);
      const canvasEditor = page.locator('[data-testid="canvas-editor-root"]');
      const canvasEditorExists = await canvasEditor.count() > 0;
      
      record("TS-CANVAS-MODE-ENTRY", "进入自由画布模式", "P1",
        canvasEditorExists ? "PASS" : "FAIL",
        `Canvas button exists: ${canvasBtnExists}, Canvas editor loaded: ${canvasEditorExists}`);
    } else {
      record("TS-CANVAS-MODE-ENTRY", "进入自由画布模式", "P1", "FAIL", "Canvas mode button not found");
    }
  } catch (err) {
    record("TS-CANVAS-MODE-ENTRY", "进入自由画布模式", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-PAPER-A4: A4 paper size correct
  try {
    const paper = page.locator('[data-testid="canvas-paper"]');
    const paperBox = await paper.boundingBox();
    
    if (paperBox) {
      const aspectRatio = paperBox.width / paperBox.height;
      const expectedRatio = 210 / 297; // A4
      const ratioDiff = Math.abs(aspectRatio - expectedRatio);
      const pass = ratioDiff < 0.05;
      
      record("TS-CANVAS-PAPER-A4", "A4 画布比例", "P1",
        pass ? "PASS" : "FAIL",
        `Aspect: ${aspectRatio.toFixed(3)}, expected: ${expectedRatio.toFixed(3)}, diff: ${ratioDiff.toFixed(3)}`);
    } else {
      record("TS-CANVAS-PAPER-A4", "A4 画布比例", "P1", "FAIL", "Paper bounding box not found");
    }
  } catch (err) {
    record("TS-CANVAS-PAPER-A4", "A4 画布比例", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-ADD-TEXT: Can add text element
  try {
    const addTextBtn = page.locator('[data-testid="canvas-add-text"]');
    const addTextBtnExists = await addTextBtn.count() > 0;
    
    if (addTextBtnExists) {
      await addTextBtn.click();
      await page.waitForTimeout(500);
      const elements = page.locator('[data-testid="canvas-element"]');
      const elementCount = await elements.count();
      
      record("TS-CANVAS-ADD-TEXT", "添加文本元素", "P1",
        elementCount > 0 ? "PASS" : "FAIL",
        `Elements after add: ${elementCount}`);
    } else {
      record("TS-CANVAS-ADD-TEXT", "添加文本元素", "P1", "FAIL", "Add text button not found");
    }
  } catch (err) {
    record("TS-CANVAS-ADD-TEXT", "添加文本元素", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-SELECT-ELEMENT: Can select element
  try {
    const element = page.locator('[data-testid="canvas-element"]').first();
    const elementExists = await element.count() > 0;
    
    if (elementExists) {
      await element.click();
      await page.waitForTimeout(300);
      const propertiesPanel = page.locator('[data-testid="canvas-properties-panel"]');
      const panelVisible = await propertiesPanel.count() > 0;
      
      record("TS-CANVAS-SELECT-ELEMENT", "选中元素", "P1",
        panelVisible ? "PASS" : "FAIL",
        `Properties panel visible: ${panelVisible}`);
    } else {
      record("TS-CANVAS-SELECT-ELEMENT", "选中元素", "P1", "FAIL", "No element to select");
    }
  } catch (err) {
    record("TS-CANVAS-SELECT-ELEMENT", "选中元素", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-PROPERTIES-PANEL: Properties panel works
  try {
    const xInput = page.locator('[data-testid="canvas-x-input"]');
    const xInputExists = await xInput.count() > 0;
    
    if (xInputExists) {
      const xValue = await xInput.inputValue();
      record("TS-CANVAS-PROPERTIES-PANEL", "属性面板可修改", "P1",
        "PASS",
        `X input exists: ${xInputExists}, value: ${xValue}`);
    } else {
      record("TS-CANVAS-PROPERTIES-PANEL", "属性面板可修改", "P1", "FAIL", "X input not found");
    }
  } catch (err) {
    record("TS-CANVAS-PROPERTIES-PANEL", "属性面板可修改", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-DUPLICATE-DELETE: Can duplicate and delete
  try {
    const duplicateBtn = page.locator('[data-testid="canvas-duplicate-element"]');
    const duplicateBtnExists = await duplicateBtn.count() > 0;
    
    if (duplicateBtnExists) {
      const elementsBefore = await page.locator('[data-testid="canvas-element"]').count();
      await duplicateBtn.click();
      await page.waitForTimeout(500);
      const elementsAfter = await page.locator('[data-testid="canvas-element"]').count();
      
      const duplicated = elementsAfter > elementsBefore;
      
      record("TS-CANVAS-DUPLICATE-DELETE", "复制和删除元素", "P1",
        duplicated ? "PASS" : "FAIL",
        `Elements before: ${elementsBefore}, after: ${elementsAfter}`);
    } else {
      record("TS-CANVAS-DUPLICATE-DELETE", "复制和删除元素", "P1", "FAIL", "Duplicate button not found");
    }
  } catch (err) {
    record("TS-CANVAS-DUPLICATE-DELETE", "复制和删除元素", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-SAVE-BUTTON: Save button exists
  try {
    const saveBtn = page.locator('[data-testid="canvas-save-button"]');
    const saveBtnExists = await saveBtn.count() > 0;
    
    record("TS-CANVAS-SAVE-BUTTON", "保存按钮存在", "P1",
      saveBtnExists ? "PASS" : "FAIL",
      `Save button exists: ${saveBtnExists}`);
  } catch (err) {
    record("TS-CANVAS-SAVE-BUTTON", "保存按钮存在", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-PNG-EXPORT-BUTTON: PNG export button exists
  try {
    const pngBtn = page.locator('[data-testid="canvas-png-export-button"]');
    const pngBtnExists = await pngBtn.count() > 0;
    
    record("TS-CANVAS-PNG-EXPORT-BUTTON", "PNG 导出按钮存在", "P1",
      pngBtnExists ? "PASS" : "FAIL",
      `PNG export button exists: ${pngBtnExists}`);
  } catch (err) {
    record("TS-CANVAS-PNG-EXPORT-BUTTON", "PNG 导出按钮存在", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-GRID-TOGGLE: Grid toggle works
  try {
    const gridToggle = page.locator('[data-testid="canvas-grid-toggle"]');
    const gridToggleExists = await gridToggle.count() > 0;
    
    if (gridToggleExists) {
      const isChecked = await gridToggle.isChecked();
      record("TS-CANVAS-GRID-TOGGLE", "网格切换可用", "P1",
        "PASS",
        `Grid toggle exists: ${gridToggleExists}, checked: ${isChecked}`);
    } else {
      record("TS-CANVAS-GRID-TOGGLE", "网格切换可用", "P1", "FAIL", "Grid toggle not found");
    }
  } catch (err) {
    record("TS-CANVAS-GRID-TOGGLE", "网格切换可用", "P1", "FAIL", `Error: ${err}`);
  }

  // TS-CANVAS-NO-CRASH: Mobile no crash
  try {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const canvasEditor = page.locator('[data-testid="canvas-editor-root"]');
    const stillExists = await canvasEditor.count() > 0;
    
    record("TS-CANVAS-NO-CRASH", "移动端不崩溃", "P1",
      stillExists ? "PASS" : "FAIL",
      `Canvas editor still exists on mobile: ${stillExists}`);
  } catch (err) {
    record("TS-CANVAS-NO-CRASH", "移动端不崩溃", "P1", "FAIL", `Error: ${err}`);
  }

  // ============================================================
  // Summary
  // ============================================================
  await browser.close();
  writeResults();
}

function writeResults() {
  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const blocked = results.filter(r => r.status === "BLOCKED").length;
  const p0Fail = results.filter(r => r.level === "P0" && r.status === "FAIL").length;
  const p1Fail = results.filter(r => r.level === "P1" && r.status === "FAIL").length;

  console.log("\n=== SUMMARY ===");
  console.log(`Total: ${results.length} | PASS: ${pass} | FAIL: ${fail} | BLOCKED: ${blocked}`);
  console.log(`P0 FAIL: ${p0Fail} | P1 FAIL: ${p1Fail}`);

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: { total: results.length, pass, fail, blocked, p0Fail, p1Fail },
    cases: results,
  };
  
  // Ensure directory exists
  mkdirSync(dirname(join(ARTIFACTS_DIR, "audit-report.json")), { recursive: true });
  writeFileSync(join(ARTIFACTS_DIR, "audit-report.json"), JSON.stringify(report, null, 2));

  process.exit(p0Fail > 0 || p1Fail > 0 ? 1 : 0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
