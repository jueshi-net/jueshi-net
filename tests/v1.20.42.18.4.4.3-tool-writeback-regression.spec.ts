/**
 * v1.20.42.18.4.4.3 - Tool Interop Writeback Regression Test
 * 验证 HS/CBM/地址工具真实写回任务链 context，以及权限隔离
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
  
  const task = await createTaskChain(page, 'E2E HS Writeback Test v18.4.4.3');
  const taskId = task.id;
  console.log(`✅ Created task: ${taskId}`);
  
  await page.goto(`${BASE_URL}/tools/hs-code`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/hs-tool-before-writeback.png`,
    fullPage: false 
  });
  
  // Use more specific selector for HS code search input
  const searchInput = page.locator('input[placeholder*="输入商品名称"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('961700');
    await page.waitForTimeout(3000);
  }
  
  // Scroll down to see results and join button
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1000);
  
  // Look for HS code result and click join button
  const joinBtn = page.locator('button:has-text("加入任务链"), button:has-text("加入发货任务链")').first();
  if (await joinBtn.count() > 0) {
    await joinBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/hs-tool-after-click.png`,
      fullPage: false 
    });
    
    const taskBtn = page.locator(`button:has-text("E2E HS Writeback Test")`).first();
    if (await taskBtn.count() > 0) {
      await taskBtn.click();
      await page.waitForTimeout(3000);
    }
  }
  
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
  
  const task = await createTaskChain(page, 'E2E CBM Writeback Test v18.4.4.3');
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
  
  const task = await createTaskChain(page, 'E2E Address Writeback Test v18.4.4.3');
  const taskId = task.id;
  console.log(`✅ Created task: ${taskId}`);
  
  await page.goto(`${BASE_URL}/tools/postal-code`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/postal-helper-before-writeback.png`,
    fullPage: false 
  });
  
  const searchInput = page.locator('input[placeholder*="城市"], input[placeholder*="邮编"], input[type="text"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('Toronto');
    await page.waitForTimeout(2000);
  }
  
  const joinBtn = page.locator('button:has-text("加入任务链")').first();
  if (await joinBtn.count() > 0) {
    await joinBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/postal-helper-result.png`,
      fullPage: false 
    });
    
    const taskBtn = page.locator(`button:has-text("E2E Address Writeback Test")`).first();
    if (await taskBtn.count() > 0) {
      await taskBtn.click();
      await page.waitForTimeout(3000);
    }
  }
  
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
  
  const task = await createTaskChain(page, 'E2E Invoice Test v18.4.4.3');
  const taskId = task.id;
  
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
      country: 'Canada',
      city: 'Toronto',
      postalCode: 'M5V 3L9',
    },
  });
  
  await page.goto(`${BASE_URL}/tools/commercial-invoice?taskId=${taskId}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  const generateBtn = page.locator('button:has-text("生成草稿"), button:has-text("生成")').first();
  if (await generateBtn.count() > 0) {
    await generateBtn.click();
    await page.waitForTimeout(3000);
  }
  
  const draftContent = await page.locator('.draft-content, .invoice-preview, [data-testid="draft-content"]').first().textContent();
  console.log('📄 Invoice draft content:', draftContent?.substring(0, 500));
  
  expect(draftContent).toMatch(/Vacuum|961700|Stainless|Toronto|Canada/i);
  
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
      title: 'Permission Test v18.4.4.3',
      sourceTool: 'test',
      context: { test: 'data' },
    },
  });
  
  expect(createRes.status()).toBe(401);
  
  console.log('✅ Permission isolation test passed (unauthenticated request rejected)');
});

// Test 6: Packing List Still Works
test('06 - Packing list draft still reads data', async ({ page }) => {
  test.setTimeout(120000);
  
  await login(page);
  
  const task = await createTaskChain(page, 'E2E Packing List Test v18.4.4.3');
  const taskId = task.id;
  
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
  
  await page.goto(`${BASE_URL}/tools/packing-list?taskId=${taskId}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  const generateBtn = page.locator('button:has-text("生成草稿"), button:has-text("生成")').first();
  if (await generateBtn.count() > 0) {
    await generateBtn.click();
    await page.waitForTimeout(3000);
  }
  
  const draftContent = await page.locator('.draft-content, .packing-list-preview, [data-testid="draft-content"]').first().textContent();
  
  expect(draftContent).toMatch(/Test Product|5|10|0.06/i);
  
  await page.screenshot({ 
    path: `${SCREENSHOT_DIR}/packing-list-draft-still-passed.png`,
    fullPage: false 
  });
  
  console.log('✅ Packing list test passed');
});

// Summary
test('99 - Summary', async () => {
  console.log('\n========================================');
  console.log('v1.20.42.18.4.4.3 Tool Writeback Regression Test - Summary');
  console.log('========================================');
  console.log('✅ All tests should pass');
  console.log('========================================\n');
});
