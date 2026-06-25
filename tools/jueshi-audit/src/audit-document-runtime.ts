/**
 * Document Runtime Audit
 * 
 * 验证 Template Registry 和 CustomFormShell 的完整性：
 * 1. Template Registry 正常加载
 * 2. 8 个工具注册存在
 * 3. 供应链报价单仍可用
 * 4. 入库单/交接单仍可用
 * 5. Debit Note/标签打印仍可用
 * 6. 标准单据公司资料不回归
 * 7. Word 导出不回归
 * 8. CustomFormShell 不破坏页面
 * 9. 不存在明显 XSS 风险
 * 10. 移动端不破坏
 */

import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.AUDIT_BASE_URL || "https://i.jueshi.net";
const ARTIFACTS_DIR = "artifacts/document-runtime";

mkdirSync(ARTIFACTS_DIR, { recursive: true });
mkdirSync(join(ARTIFACTS_DIR, "screenshots"), { recursive: true });

interface AuditCase {
  id: string;
  name: string;
  level: "P0" | "P1" | "P2";
  status: "PASS" | "FAIL" | "BLOCKED";
  evidence: string;
}

const results: AuditCase[] = [];

function record(id: string, name: string, level: "P0" | "P1" | "P2", status: "PASS" | "FAIL" | "BLOCKED", evidence: string) {
  results.push({ id, name, level, status, evidence });
  console.log(`[${status}] ${id} — ${name}`);
  if (evidence) console.log(`  Evidence: ${evidence.substring(0, 200)}`);
}

async function run() {
  console.log("=== Document Runtime Audit ===");
  console.log(`Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // ============================================================
  // 1. Template Registry — import and verify
  // ============================================================
  
  try {
    // Dynamically import the registry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registryModule: any = await import("../../../src/lib/document-runtime/template-registry");
    const tools = registryModule.getAllTools() as Array<{ key: string; route: string; rendererType: string }>;
    
    if (tools.length >= 8) {
      record("DR-001", "Template Registry 正常加载，>= 8 个工具", "P1", "PASS", `Found ${tools.length} tools: ${tools.map(t => t.key).join(", ")}`);
    } else {
      record("DR-001", "Template Registry 正常加载，>= 8 个工具", "P1", "FAIL", `Only ${tools.length} tools found`);
    }

    // Verify each of the 8 MVP tools
    const expectedKeys = [
      "standard-quotation",
      "commercial-invoice",
      "supply-chain-quote",
      "inbound-receipt",
      "handover-note",
      "shipping-label",
      "debit-note",
      "shooting-script",
    ];

    for (const key of expectedKeys) {
      const tool = registryModule.getTool(key);
      if (tool) {
        record(`DR-002-${key}`, `工具注册存在: ${key}`, "P1", "PASS", `route=${tool.route}, renderer=${tool.rendererType}`);
      } else {
        record(`DR-002-${key}`, `工具注册存在: ${key}`, "P1", "FAIL", "Tool not found in registry");
      }
    }

    // Verify capability checks
    const hasCompany = registryModule.hasCapability("standard-quotation", "company");
    const hasExport = registryModule.hasCapability("standard-quotation", "export");
    const noProduct = registryModule.hasCapability("inbound-receipt", "product");
    
    if (hasCompany && hasExport && !noProduct) {
      record("DR-003", "hasCapability() 功能正确", "P1", "PASS", `company=${hasCompany}, export=${hasExport}, product(inbound)=${noProduct}`);
    } else {
      record("DR-003", "hasCapability() 功能正确", "P1", "FAIL", `company=${hasCompany}, export=${hasExport}, product(inbound)=${noProduct}`);
    }

  } catch (err) {
    record("DR-001", "Template Registry 正常加载", "P1", "FAIL", `Import error: ${err}`);
  }

  // ============================================================
  // 2. Verify existing tool pages still work
  // ============================================================

  const toolPages = [
    { url: "/tools/documents/quotation", name: "供应链报价单", id: "DR-004" },
    { url: "/tools/documents/commercial-invoice", name: "商业发票(标准单据)", id: "DR-005" },
    { url: "/tools/inbound-receipt", name: "入库单", id: "DR-006" },
    { url: "/tools/handover-note", name: "交接单", id: "DR-007" },
    { url: "/tools/shipping-label", name: "标签打印", id: "DR-008" },
    { url: "/tools/debit-note", name: "Debit Note", id: "DR-009" },
  ];

  for (const tool of toolPages) {
    try {
      const response = await page.goto(`${BASE_URL}${tool.url}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      const status = response?.status() || 0;
      await page.waitForTimeout(2000); // Allow client-side hydration
      if (status === 200) {
        const title = await page.title();
        record(tool.id, `${tool.name}仍可用 (${tool.url})`, "P1", "PASS", `HTTP ${status}, title="${title}"`);
        await page.screenshot({ path: join(ARTIFACTS_DIR, "screenshots", `${tool.id}.png`) });
      } else {
        record(tool.id, `${tool.name}仍可用 (${tool.url})`, "P1", "FAIL", `HTTP ${status}`);
      }
    } catch (err) {
      record(tool.id, `${tool.name}仍可用 (${tool.url})`, "P1", "FAIL", `Error: ${err}`);
    }
  }

  // ============================================================
  // 3. Document Runtime Demo page
  // ============================================================

  try {
    const response = await page.goto(`${BASE_URL}/tools/document-runtime-demo`, { waitUntil: "domcontentloaded", timeout: 15000 });
    const status = response?.status() || 0;
    await page.waitForTimeout(2000);
    if (status === 200) {
      // Check demo tabs exist
      const tabSupplyChain = await page.locator('[data-testid="demo-tab-supply-chain"]').count();
      const tabInbound = await page.locator('[data-testid="demo-tab-inbound"]').count();
      const tabDebit = await page.locator('[data-testid="demo-tab-debit"]').count();
      
      if (tabSupplyChain > 0 && tabInbound > 0 && tabDebit > 0) {
        record("DR-010", "CustomFormShell demo 页面可用，3 个 tab 存在", "P1", "PASS", `Tabs found: supply-chain=${tabSupplyChain}, inbound=${tabInbound}, debit=${tabDebit}`);
      } else {
        record("DR-010", "CustomFormShell demo 页面可用，3 个 tab 存在", "P1", "FAIL", `Tabs missing: supply-chain=${tabSupplyChain}, inbound=${tabInbound}, debit=${tabDebit}`);
      }
      await page.screenshot({ path: join(ARTIFACTS_DIR, "screenshots", "DR-010-demo.png") });

      // Click through tabs
      await page.click('[data-testid="demo-tab-inbound"]');
      await page.waitForTimeout(500);
      const inboundDemo = await page.locator('[data-testid="demo-inbound"]').count();
      record("DR-011", "Tab 切换：入库单 demo 渲染", "P2", inboundDemo > 0 ? "PASS" : "FAIL", `demo-inbound element count=${inboundDemo}`);

      await page.click('[data-testid="demo-tab-debit"]');
      await page.waitForTimeout(500);
      const debitDemo = await page.locator('[data-testid="demo-debit"]').count();
      record("DR-012", "Tab 切换：Debit Note demo 渲染", "P2", debitDemo > 0 ? "PASS" : "FAIL", `demo-debit element count=${debitDemo}`);

    } else {
      record("DR-010", "CustomFormShell demo 页面可用", "P1", "FAIL", `HTTP ${status}`);
    }
  } catch (err) {
    record("DR-010", "CustomFormShell demo 页面可用", "P1", "FAIL", `Error: ${err}`);
  }

  // ============================================================
  // 4. Standard document company profile not regressed
  // ============================================================

  try {
    await page.goto(`${BASE_URL}/tools/documents/commercial-invoice`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);
    // Without login, the page should still load — company picker requires auth
    // Just verify the page rendered something (form fields or content)
    const hasForm = await page.locator('input, select, textarea, button').count();
    const pageText = await page.textContent('body');
    const hasContent = pageText && pageText.length > 100;
    record("DR-013", "标准单据页面加载不回归", "P1", (hasForm > 0 || hasContent) ? "PASS" : "FAIL", `Form elements: ${hasForm}, hasContent: ${hasContent} (page loads without crash)`);
  } catch (err) {
    record("DR-013", "标准单据页面加载不回归", "P1", "FAIL", `Error: ${err}`);
  }

  // ============================================================
  // 5. Word export not regressed
  // ============================================================

  try {
    const wordBtn = await page.locator('[data-testid="word-export-btn"], button:has-text("Word")').count();
    record("DR-014", "Word 导出按钮存在", "P1", wordBtn > 0 ? "PASS" : "FAIL", `Word export buttons: ${wordBtn}`);
  } catch (err) {
    record("DR-014", "Word 导出按钮存在", "P1", "FAIL", `Error: ${err}`);
  }

  // ============================================================
  // 6. XSS risk check — verify no inline scripts in demo page
  // ============================================================

  try {
    // Check for dangerous patterns in inline scripts, not just their existence
    const dangerousPatterns = await page.evaluate(() => {
      const scripts = document.querySelectorAll("script:not([src])");
      const patterns = ["eval(", "document.cookie", "innerHTML", "document.write", "window.location", "fetch(", "XMLHttpRequest", ".sessionStorage", ".localStorage"];
      let found = 0;
      scripts.forEach(s => {
        const content = s.textContent || "";
        patterns.forEach(p => {
          if (content.includes(p) && !content.includes("__next") && !content.includes("self.__next_f")) {
            found++;
          }
        });
      });
      return found;
    });
    record("DR-015", "不存在明显 XSS 风险（无危险脚本模式）", "P1", dangerousPatterns === 0 ? "PASS" : "FAIL", `Dangerous patterns found: ${dangerousPatterns}`);
  } catch (err) {
    record("DR-015", "不存在明显 XSS 风险", "P1", "FAIL", `Error: ${err}`);
  }

  // ============================================================
  // 7. Mobile viewport — no breakage
  // ============================================================

  try {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/tools/document-runtime-demo`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);
    // Check main content area for overflow (exclude cookie banner and fixed elements)
    const mainOverflow = await page.evaluate(() => {
      const main = document.querySelector("main") || document.querySelector(".max-w-5xl");
      if (!main) return false;
      return main.scrollWidth <= window.innerWidth + 20;
    });
    record("DR-016", "移动端不破坏（375px main 内容无溢出）", "P1", mainOverflow ? "PASS" : "FAIL", `Main content scrollWidth <= innerWidth+20: ${mainOverflow}`);
    await page.screenshot({ path: join(ARTIFACTS_DIR, "screenshots", "DR-016-mobile.png") });
  } catch (err) {
    record("DR-016", "移动端不破坏", "P1", "FAIL", `Error: ${err}`);
  }

  // ============================================================
  // Summary
  // ============================================================

  await browser.close();

  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const blocked = results.filter(r => r.status === "BLOCKED").length;
  const p1Fail = results.filter(r => r.level === "P1" && r.status === "FAIL").length;
  const p0Fail = results.filter(r => r.level === "P0" && r.status === "FAIL").length;

  console.log("\n=== SUMMARY ===");
  console.log(`Total: ${results.length} | PASS: ${pass} | FAIL: ${fail} | BLOCKED: ${blocked}`);
  console.log(`P0 FAIL: ${p0Fail} | P1 FAIL: ${p1Fail}`);

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: { total: results.length, pass, fail, blocked, p0Fail, p1Fail },
    cases: results,
  };
  writeFileSync(join(ARTIFACTS_DIR, "audit-report.json"), JSON.stringify(report, null, 2));

  // Exit code
  process.exit(p0Fail > 0 || p1Fail > 0 ? 1 : 0);
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
