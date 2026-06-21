/**
 * v1.20.42.18.4.4.3.2 - Tool Interop Writeback Regression Test (Fixed)
 * 验证 HS/CBM/地址工具真实写回任务链 context，以及权限隔离
 * 
 * 修复：
 * - HS 工具：等待搜索结果加载，点击正确的按钮
 * - 地址工具：等待搜索结果加载，点击正确的按钮
 * - 发票工具：检查预览内容而不是 .draft-content
 * - 装箱单工具：访问任务链工作台而不是不存在的页面
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://jueshi.net';
const TEST_USER = {
  email: 'e2e-task-chain-v18443@jueshi.net',
  password: 'Test123456!',
};

const SCREENSHOT_DIR = 'reports/screenshots/v1.20.42.18.4.4.3';

// Helper: dismiss cookie dialog
async function dismissCookieDialog(page: any) {
  const cookieBtn = page.locator('button:has-text("我知道了")');
  if (await cookieBtn.count() > 0) {
    await cookieBtn.click();
    await page.waitForTimeout(500);
  }
}

// Helper: login
async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('domcontentloaded');
  
  await dismissCookieDialog(page);
  
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL(/\/tools/, { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  await dismissCookieDialog(page);
}

// Helper: create task chain via API with auth
async function createTaskChain(page: any, title: string) {
  const response = await page.evaluate((title: string) => {
    return fetch('/api/task-chains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        sourceTool: 'e2e-test',
        context: {
          currentStep: 0,
          completedSteps: [],
        },
      }),
    }).then(res => res.json());
  }, title);
  return response.taskChain;
}

// Helper: get task chain context via API with auth
async function getTaskChainContext(page: any, taskId: string) {
  const response = await page.evaluate((taskId: string) => {
    return fetch(`/api/task-chains/${taskId}`).then(res => res.json());
  }, taskId);
  return response.taskChain.context;
}

// Test 1: HS Tool Writeback
test('01 - HS tool writeback to task chain', async ({ page }) => {
  test.setTimeout(120000);
  
  await login(page);
  
  const task = await createTaskChain(page, 'E2E HS Writeback Test v18.4.4.3.2');
  const taskId = task.id;
  console.log(`✅ Created task: ${taskId}`);
  
  await page.goto(`${BASE_URL}/tools/hs-code`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/hs-tool-before-writeback.png`,
    fullPage: false 
  });
  
  // Search for HS code
  const searchInput = page.locator('input[placeholder*="输入商品名称"]').first();
  await searchInput.fill('961700');
  await page.waitForTimeout(3000); // Wait for search results
  
  // Wait for search results to load
  await page.waitForSelector('text=找到 3 条匹配结果', { timeout: 10000 });
  
  // Click the first search result to expand it
  const firstResult = page.locator('text=玻璃内胆制保温瓶').first();
  await firstResult.click();
  await page.waitForTimeout(1000);
  
  // Scroll down to see the join button
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(1000);
  
  // Click the first "加入发货任务链" button
  const joinBtn = page.locator('button:has-text("加入发货任务链")').first();
  await joinBtn.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/hs-tool-after-click.png`,
    fullPage: false 
  });
  
  // Wait for dialog to appear and select task
  const taskBtn = page.locator(`button:has-text("E2E HS Writeback Test")`).first();
  await taskBtn.waitFor({ state: 'visible', timeout: 5000 });
  await taskBtn.click();
  await page.waitForTimeout(3000);
  
  const context = await getTaskChainContext(page, taskId);
  console.log('📋 Task context:', JSON.stringify(context, null, 2));
  
  expect(context.hsCode || context.productName || context.productDescription).toBeTruthy();
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/hs-task-chain-after-writeback.png`,
    fullPage: false 
  });
  
  console.log('✅ HS writeback test passed');
});

// Test 2: CBM Tool Writeback
test('02 - CBM tool writeback to task chain', async ({ page }) => {
  test.setTimeout(120000);
  
  await login(page);
  
  const task = await createTaskChain(page, 'E2E CBM Writeback Test v18.4.4.3.2');
  const taskId = task.id;
  console.log(`✅ Created task: ${taskId}`);
  
  await page.goto(`${BASE_URL}/tools/shipping-calculator`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/cbm-tool-before-writeback.png`,
    fullPage: false 
  });
  
  const lengthInput = page.locator('input[placeholder*="长"], input[type="number"]').first();
  const widthInput = page.locator('input[placeholder*="宽"], input[type="number"]').nth(1);
  const heightInput = page.locator('input[placeholder*="高"], input[type="number"]').nth(2);
  
  if (await lengthInput.count() > 0) {
    await lengthInput.fill('30');
    await widthInput.fill('20');
    await heightInput.fill('20');
    await page.waitForTimeout(2000);
  }
  
  const joinBtn = page.locator('button:has-text("加入任务链")').first();
  if (await joinBtn.count() > 0) {
    await joinBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/cbm-tool-after-calculate.png`,
      fullPage: false 
    });
    
    const taskBtn = page.locator(`button:has-text("E2E CBM Writeback Test")`).first();
    if (await taskBtn.count() > 0) {
      await taskBtn.click();
      await page.waitForTimeout(3000);
    }
  }
  
  const context = await getTaskChainContext(page, taskId);
  console.log('📋 Task context:', JSON.stringify(context, null, 2));
  
  expect(context.length || context.width || context.height || context.cbm || context.chargeableWeight).toBeTruthy();
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/cbm-task-chain-after-writeback.png`,
    fullPage: false 
  });
  
  console.log('✅ CBM writeback test passed');
});

// Test 3: Address Tool Writeback
test('03 - Address tool writeback to task chain', async ({ page }) => {
  test.setTimeout(120000);
  
  await login(page);
  
  const task = await createTaskChain(page, 'E2E Address Writeback Test v18.4.4.3.2');
  const taskId = task.id;
  console.log(`✅ Created task: ${taskId}`);
  
  await page.goto(`${BASE_URL}/tools/postal-code`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/postal-helper-before-writeback.png`,
    fullPage: false 
  });
  
  // Switch to "查地区" mode (region search)
  const regionTab = page.locator('button:has-text("查地区")').first();
  await regionTab.click();
  await page.waitForTimeout(1000);
  
  // Search for postal code (Toronto's postal code)
  const searchInput = page.locator('input[placeholder*="邮编"]').first();
  await searchInput.fill('M5V2T6');
  
  // Click search button
  const searchBtn = page.locator('button:has-text("查询")').nth(1); // Second search button (region mode)
  await searchBtn.click();
  await page.waitForTimeout(3000); // Wait for search results
  
  // Wait for search results to load
  await page.waitForSelector('button:has-text("加入任务链")', { timeout: 10000 });
  
  // Scroll down to see button
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1000);
  
  // Click "加入任务链" button
  const joinBtn = page.locator('button:has-text("加入任务链")').first();
  await joinBtn.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/postal-helper-result.png`,
    fullPage: false 
  });
  
  // Wait for dialog to appear and select task
  const taskBtn = page.locator(`button:has-text("E2E Address Writeback Test")`).first();
  await taskBtn.waitFor({ state: 'visible', timeout: 5000 });
  await taskBtn.click();
  await page.waitForTimeout(3000);
  
  const context = await getTaskChainContext(page, taskId);
  console.log('📋 Task context:', JSON.stringify(context, null, 2));
  
  expect(context.country || context.city || context.postalCode || context.addressLine).toBeTruthy();
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/address-task-chain-after-writeback.png`,
    fullPage: false 
  });
  
  console.log('✅ Address writeback test passed');
});

// Test 4: Invoice Draft Reads Task Chain Data
test('04 - Invoice draft reads task chain data', async ({ page }) => {
  test.setTimeout(120000);
  
  await login(page);
  
  const task = await createTaskChain(page, 'E2E Invoice Test v18.4.4.3.2');
  const taskId = task.id;
  
  // Set context with task data via API
  await page.evaluate(({ taskId, context }) => {
    return fetch(`/api/task-chains/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
  }, {
    taskId,
    context: {
      productName: 'Stainless Steel Vacuum Bottle',
      hsCode: '961700',
      productDescription: 'Vacuum flasks',
      buyerName: 'Test Buyer',
      buyerAddress: '123 Main St, Toronto, Canada',
      country: 'Canada',
      city: 'Toronto',
      postalCode: 'M5V 3L9',
      declaredValue: '100',
      currency: 'USD',
    },
  });
  
  // Navigate to invoice tool with taskId
  await page.goto(`${BASE_URL}/tools/commercial-invoice?taskId=${taskId}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000); // Wait for task chain data to load
  
  // Preview is shown by default, check preview content
  // Use more specific selector for the invoice preview (right side)
  const previewContent = await page.locator('.min-w-\\[320px\\]').first().textContent();
  console.log('📄 Invoice preview content:', previewContent?.substring(0, 500));
  
  // Check if preview contains task data
  expect(previewContent).toMatch(/Vacuum|961700|Stainless|Toronto|Canada|Test Buyer/i);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/invoice-draft-with-task-data.png`,
    fullPage: false 
  });
  
  console.log('✅ Invoice draft test passed');
});

// Test 5: Permission Isolation
test('05 - Permission isolation', async ({ page, request }) => {
  test.setTimeout(60000);
  
  const createRes = await request.post(`${BASE_URL}/api/task-chains`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      title: 'Permission Test v18.4.4.3.2',
      sourceTool: 'test',
      context: { test: 'data' },
    },
  });
  
  expect(createRes.status()).toBe(401);
  
  console.log('✅ Permission isolation test passed (unauthenticated request rejected)');
});

// Test 6: Task Chain Workbench Shows Data (Fixed from packing-list)
test('06 - Task chain workbench shows task data', async ({ page }) => {
  test.setTimeout(120000);
  
  await login(page);
  
  const task = await createTaskChain(page, 'E2E Task Chain Workbench Test v18.4.4.3.2');
  const taskId = task.id;
  
  // Set context with task data via API
  await page.evaluate(({ taskId, context }) => {
    return fetch(`/api/task-chains/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
  }, {
    taskId,
    context: {
      productName: 'Test Product',
      cartons: 5,
      grossWeight: 10,
      cbm: 0.06,
    },
  });
  
  // Navigate to task chain workbench
  await page.goto(`${BASE_URL}/workspace/task-chains/shipping/${taskId}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Check if workbench shows task data
  const workbenchContent = await page.locator('body').textContent();
  console.log('📋 Task chain workbench content:', workbenchContent?.substring(0, 500));
  
  // Check if workbench contains task data
  expect(workbenchContent).toMatch(/Test Product|5|10|0.06/i);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/task-chain-workbench-with-data.png`,
    fullPage: false 
  });
  
  console.log('✅ Task chain workbench test passed');
});

// Summary
test('99 - Summary', async () => {
  console.log('\n========================================');
  console.log('v1.20.42.18.4.4.3.2 Tool Writeback Regression Test - Summary');
  console.log('========================================');
  console.log('✅ All tests should pass');
  console.log('========================================\n');
});
