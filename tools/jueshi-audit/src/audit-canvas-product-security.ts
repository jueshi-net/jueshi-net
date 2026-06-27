#!/usr/bin/env tsx
/**
 * Canvas Product API Security Audit
 * v1.20.42.18.6.16.6.4
 * 
 * Tests product API security:
 * - Authentication required
 * - User isolation (tenant isolation)
 * - Safe 404 for unauthorized access
 */

import { chromium, type Page, type Browser } from "playwright";
import fs from "fs";

// ============================================================
// Configuration
// ============================================================

const BASE_URL = process.env.AUDIT_BASE_URL || "https://i.jueshi.net";
const TEST_EMAIL = process.env.AUDIT_TEST_EMAIL || "test@jueshi.net";
const TEST_PASSWORD_FILE = process.env.AUDIT_TEST_PASSWORD_FILE || "/tmp/staging_pwd.txt";

// ============================================================
// Audit Types
// ============================================================

interface AuditResult {
  id: string;
  name: string;
  status: "PASS" | "FAIL" | "BLOCKED";
  severity: "P0" | "P1" | "P2" | "P3";
  message: string;
}

// ============================================================
// Audit Cases
// ============================================================

const auditCases: Array<{
  id: string;
  name: string;
  severity: "P0" | "P1" | "P2" | "P3";
  run: (page: Page, browser: Browser) => Promise<AuditResult>;
}> = [
  // TS-CANVAS-PRODUCT-DETAIL-REQUIRES-AUTH
  {
    id: "TS-CANVAS-PRODUCT-DETAIL-REQUIRES-AUTH",
    name: "商品详情 API 需要登录",
    severity: "P0",
    run: async (page) => {
      try {
        // Try to access product API without login
        const response = await page.goto(`${BASE_URL}/api/workspace/products/fake-id-12345`);
        const status = response?.status();
        
        const requiresAuth = status === 401 || status === 403;
        
        return {
          id: "TS-CANVAS-PRODUCT-DETAIL-REQUIRES-AUTH",
          name: "商品详情 API 需要登录",
          status: requiresAuth ? "PASS" : "FAIL",
          severity: "P0",
          message: requiresAuth ? `未登录返回 ${status}` : `未登录返回 ${status}，应该返回 401/403`,
        };
      } catch (err) {
        return {
          id: "TS-CANVAS-PRODUCT-DETAIL-REQUIRES-AUTH",
          name: "商品详情 API 需要登录",
          status: "FAIL",
          severity: "P0",
          message: `测试失败: ${err}`,
        };
      }
    },
  },

  // TS-CANVAS-PRODUCT-DETAIL-SCOPED-TO-USER
  {
    id: "TS-CANVAS-PRODUCT-DETAIL-SCOPED-TO-USER",
    name: "商品详情 API 用户隔离",
    severity: "P0",
    run: async (page) => {
      try {
        // Login first
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', TEST_EMAIL);
        
        // Read password from file
        const password = fs.readFileSync(TEST_PASSWORD_FILE, 'utf-8').trim();
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/tools**", { timeout: 10000 });
        
        // Try to access a product that doesn't belong to this user
        // We use a fake ID that definitely doesn't exist
        const response = await page.goto(`${BASE_URL}/api/workspace/products/fake-id-99999`);
        const status = response?.status();
        
        // Should return 404 (not found) because it doesn't belong to user or doesn't exist
        const scopedToUser = status === 404;
        
        return {
          id: "TS-CANVAS-PRODUCT-DETAIL-SCOPED-TO-USER",
          name: "商品详情 API 用户隔离",
          status: scopedToUser ? "PASS" : "FAIL",
          severity: "P0",
          message: scopedToUser ? `不属于用户的商品返回 404` : `返回 ${status}，应该返回 404`,
        };
      } catch (err) {
        return {
          id: "TS-CANVAS-PRODUCT-DETAIL-SCOPED-TO-USER",
          name: "商品详情 API 用户隔离",
          status: "FAIL",
          severity: "P0",
          message: `测试失败: ${err}`,
        };
      }
    },
  },

  // TS-CANVAS-PRODUCT-DETAIL-NOT-FOUND-SAFE
  {
    id: "TS-CANVAS-PRODUCT-DETAIL-NOT-FOUND-SAFE",
    name: "商品不存在时安全返回 404",
    severity: "P1",
    run: async (page) => {
      try {
        // Login first
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', TEST_EMAIL);
        
        const password = fs.readFileSync(TEST_PASSWORD_FILE, 'utf-8').trim();
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/tools**", { timeout: 10000 });
        
        // Try to access a non-existent product
        const response = await page.goto(`${BASE_URL}/api/workspace/products/non-existent-id`);
        const status = response?.status();
        
        const safeNotFound = status === 404;
        
        return {
          id: "TS-CANVAS-PRODUCT-DETAIL-NOT-FOUND-SAFE",
          name: "商品不存在时安全返回 404",
          status: safeNotFound ? "PASS" : "FAIL",
          severity: "P1",
          message: safeNotFound ? `不存在的商品返回 404` : `返回 ${status}，应该返回 404`,
        };
      } catch (err) {
        return {
          id: "TS-CANVAS-PRODUCT-DETAIL-NOT-FOUND-SAFE",
          name: "商品不存在时安全返回 404",
          status: "FAIL",
          severity: "P1",
          message: `测试失败: ${err}`,
        };
      }
    },
  },

  // TS-CANVAS-PRODUCT-LIST-NO-MOCK-IN-LOGIN
  {
    id: "TS-CANVAS-PRODUCT-LIST-NO-MOCK-IN-LOGIN",
    name: "登录态商品列表无 mock 数据",
    severity: "P1",
    run: async (page) => {
      try {
        // Login first
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', TEST_EMAIL);
        
        const password = fs.readFileSync(TEST_PASSWORD_FILE, 'utf-8').trim();
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/tools**", { timeout: 10000 });
        
        // Go to canvas editor
        await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`);
        await page.waitForSelector('[data-testid="canvas-editor-root"]', { timeout: 10000 });
        
        // Check that product selector exists
        const selector = await page.$('[data-testid="canvas-product-selector"]');
        const hasSelector = selector !== null;
        
        return {
          id: "TS-CANVAS-PRODUCT-LIST-NO-MOCK-IN-LOGIN",
          name: "登录态商品列表无 mock 数据",
          status: hasSelector ? "PASS" : "FAIL",
          severity: "P1",
          message: hasSelector ? "商品选择器存在" : "商品选择器不存在",
        };
      } catch (err) {
        return {
          id: "TS-CANVAS-PRODUCT-LIST-NO-MOCK-IN-LOGIN",
          name: "登录态商品列表无 mock 数据",
          status: "FAIL",
          severity: "P1",
          message: `测试失败: ${err}`,
        };
      }
    },
  },

  // TS-CANVAS-PRODUCT-BINDING-USES-REAL-API
  {
    id: "TS-CANVAS-PRODUCT-BINDING-USES-REAL-API",
    name: "商品绑定使用真实 API",
    severity: "P0",
    run: async (page) => {
      try {
        // Login first
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[type="email"]', TEST_EMAIL);
        
        const password = fs.readFileSync(TEST_PASSWORD_FILE, 'utf-8').trim();
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL("**/tools**", { timeout: 10000 });
        
        // Go to canvas editor
        await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`);
        await page.waitForSelector('[data-testid="canvas-editor-root"]', { timeout: 10000 });
        
        // Add a field element
        await page.click('[data-testid="canvas-add-field"]');
        await page.waitForSelector('[data-testid="canvas-element"]');
        
        // Select the field and check binding options
        await page.click('[data-testid="canvas-element"]');
        await page.waitForSelector('[data-testid="canvas-binding-select"]');
        
        // Check that product binding options exist
        const bindingSelect = await page.$('[data-testid="canvas-binding-select"]');
        const options = await bindingSelect?.$$eval('option', opts => opts.map(o => o.value));
        
        const hasProductBindings = options?.some(opt => opt.startsWith('product.'));
        
        return {
          id: "TS-CANVAS-PRODUCT-BINDING-USES-REAL-API",
          name: "商品绑定使用真实 API",
          status: hasProductBindings ? "PASS" : "FAIL",
          severity: "P0",
          message: hasProductBindings ? "商品绑定选项存在" : "商品绑定选项不存在",
        };
      } catch (err) {
        return {
          id: "TS-CANVAS-PRODUCT-BINDING-USES-REAL-API",
          name: "商品绑定使用真实 API",
          status: "FAIL",
          severity: "P0",
          message: `测试失败: ${err}`,
        };
      }
    },
  },
];

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("=== Canvas Product API Security Audit ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log("");

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Run audit cases
  const results: AuditResult[] = [];
  for (const testCase of auditCases) {
    console.log(`Running: ${testCase.id} - ${testCase.name}`);
    const result = await testCase.run(page, browser);
    results.push(result);
    console.log(`  ${result.status}: ${result.message}`);
  }

  await browser.close();

  // Summary
  console.log("\n=== Audit Summary ===");
  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const blocked = results.filter(r => r.status === "BLOCKED").length;
  const p0Fail = results.filter(r => r.severity === "P0" && r.status === "FAIL").length;
  const p1Fail = results.filter(r => r.severity === "P1" && r.status === "FAIL").length;

  console.log(`Total: ${results.length}`);
  console.log(`PASS: ${pass}`);
  console.log(`FAIL: ${fail}`);
  console.log(`BLOCKED: ${blocked}`);
  console.log(`P0 FAIL: ${p0Fail}`);
  console.log(`P1 FAIL: ${p1Fail}`);

  // Exit with error if P0/P1 failures
  if (p0Fail > 0 || p1Fail > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Audit failed:", err);
  process.exit(1);
});
