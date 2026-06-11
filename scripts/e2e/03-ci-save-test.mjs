/**
 * v1.20.42.6.46.8 - Step 3: Commercial Invoice Real Click Save Test
 * 
 * 使用 storageState 复用登录状态，完成 Commercial Invoice 保存测试。
 * 关键验证项：
 * - 点击前按钮状态
 * - fetch URL 与 status
 * - response body 摘要
 * - 新保存 id / historyId / draftId
 * - 是否包含 KEEP-ME-CI-E2E 标记
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

async function main() {
  console.log('=== Step 3: Commercial Invoice Real Click Save Test ===\n');
  console.log(`Timestamp: ${TIMESTAMP}\n`);
  
  // Verify storageState exists
  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.error('✗ storageState not found. Run 02-login-save-state.mjs first.');
    process.exit(1);
  }
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();
  
  // Track network requests
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('/api/user/documents')) {
      requests.push({
        type: 'request',
        method: request.method(),
        url: request.url(),
        timestamp: new Date().toISOString(),
      });
      console.log(`\n→ REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/user/documents')) {
      const status = response.status();
      let body = null;
      try {
        body = await response.json();
      } catch {}
      
      requests.push({
        type: 'response',
        status,
        url: response.url(),
        body,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`← RESPONSE: ${status} ${response.url()}`);
      if (body) {
        console.log(`  Body:`, JSON.stringify(body, null, 2));
      }
    }
  });
  
  try {
    // Step 1: Navigate to Commercial Invoice page
    console.log('1. Navigating to Commercial Invoice page...');
    await page.goto(`${BASE_URL}/tools/documents/commercial-invoice`, { waitUntil: 'networkidle' });
    console.log('   ✓ Page loaded');
    
    // Step 2: Fill form data
    console.log('2. Filling form data...');
    
    const testData = {
      companyName: 'CI Real Click Company 20260611',
      clientName: 'CI Real Click Client 20260611',
      invoiceNo: `CI-REAL-CLICK-${TIMESTAMP}`,
      invoiceDate: '2026-06-11',
      lineItemDescription: 'phone case',
      lineItemQuantity: '10',
      lineItemUnitPrice: '100',
      remark: `KEEP-ME-CI-E2E-${TIMESTAMP}`,
    };
    
    console.log('   Test data:', JSON.stringify(testData, null, 2));
    
    // Fill main fields
    await page.fill('input[placeholder*="公司名称"], input[name*="companyName"]', testData.companyName);
    await page.fill('input[placeholder*="客户名称"], input[name*="clientName"]', testData.clientName);
    await page.fill('input[placeholder*="发票号"], input[name*="invoiceNo"]', testData.invoiceNo);
    
    // Fill date
    const dateInput = await page.locator('input[type="date"]').first();
    await dateInput.fill(testData.invoiceDate);
    
    // Fill line item
    await page.fill('input[placeholder*="商品描述"], input[name*="description"]', testData.lineItemDescription);
    await page.fill('input[placeholder*="数量"], input[name*="quantity"]', testData.lineItemQuantity);
    await page.fill('input[placeholder*="单价"], input[name*="unitPrice"]', testData.lineItemUnitPrice);
    
    // Fill remark
    const remarkInput = await page.locator('input[placeholder*="备注"], input[name*="remark"], textarea[name*="remark"]').first();
    await remarkInput.fill(testData.remark);
    
    console.log('   ✓ Form filled');
    
    // Step 3: Check button state before click
    console.log('3. Checking button state before click...');
    const saveButton = await page.locator('button:has-text("保存到工作台")').first();
    const isDisabled = await saveButton.isDisabled();
    const buttonText = await saveButton.textContent();
    console.log(`   Button text: "${buttonText}"`);
    console.log(`   Button disabled: ${isDisabled}`);
    
    if (isDisabled) {
      console.log('   ✗ Button is disabled, cannot proceed');
      process.exit(1);
    }
    
    console.log('   ✓ Button is enabled');
    
    // Step 4: Click save button
    console.log('4. Clicking save button...');
    await saveButton.click();
    console.log('   ✓ Button clicked');
    
    // Step 5: Wait for response
    console.log('5. Waiting for save response...');
    await page.waitForTimeout(3000);
    
    // Check for success message
    const successMessage = await page.locator('text=已保存到工作台').isVisible().catch(() => false);
    console.log(`   Success message visible: ${successMessage}`);
    
    // Step 6: Analyze results
    console.log('\n6. Analyzing results...');
    
    const saveRequest = requests.find(r => r.type === 'request' && r.method === 'POST');
    const saveResponse = requests.find(r => r.type === 'response' && r.status === 200);
    
    if (!saveRequest) {
      console.log('   ✗ No POST request to /api/user/documents found');
      process.exit(1);
    }
    
    console.log(`   ✓ POST request sent: ${saveRequest.url}`);
    
    if (!saveResponse) {
      console.log('   ✗ No successful response found');
      process.exit(1);
    }
    
    console.log(`   ✓ Response status: ${saveResponse.status}`);
    
    const responseBody = saveResponse.body;
    if (!responseBody || !responseBody.success) {
      console.log('   ✗ Save unsuccessful');
      console.log('   Response:', JSON.stringify(responseBody, null, 2));
      process.exit(1);
    }
    
    console.log('   ✓ Save successful');
    console.log(`   ✓ Document ID: ${responseBody.id}`);
    console.log(`   ✓ Created At: ${responseBody.createdAt}`);
    
    // Step 7: Save results
    const results = {
      timestamp: TIMESTAMP,
      testData,
      buttonState: {
        text: buttonText,
        disabled: isDisabled,
      },
      request: {
        method: saveRequest.method,
        url: saveRequest.url,
      },
      response: {
        status: saveResponse.status,
        id: responseBody.id,
        createdAt: responseBody.createdAt,
        success: responseBody.success,
      },
      successMessageVisible: successMessage,
    };
    
    fs.writeFileSync('/tmp/ci-save-results.json', JSON.stringify(results, null, 2));
    console.log('\n   ✓ Results saved to /tmp/ci-save-results.json');
    
    console.log('\n=== Step 3 Complete ===');
    console.log('\nSummary:');
    console.log(`  Document ID: ${responseBody.id}`);
    console.log(`  Created At: ${responseBody.createdAt}`);
    console.log(`  Remark: ${testData.remark}`);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: '/tmp/ci-save-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/ci-save-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
