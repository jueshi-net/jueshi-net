/**
 * v1.20.42.6.46.8 - Step 2 (Final): Login with Cookie Popup Handling
 * 
 * 关键改进：
 * 1. 先关闭 Cookie 弹窗
 * 2. 然后再提交登录表单
 * 3. 监控所有 API 请求
 */

import { chromium } from 'playwright';
import fs from 'fs';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Step 2 (Final): Login with Cookie Popup Handling ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor API requests
  page.on('request', request => {
    if (request.url().includes('/api/auth')) {
      console.log(`→ ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/auth')) {
      console.log(`← ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // Step 1: Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log('   ✓ Login page loaded');
    
    // Step 2: Close Cookie popup if exists
    console.log('2. Checking for Cookie popup...');
    const cookieButton = await page.locator('button:has-text("我知道了")').first();
    if (await cookieButton.isVisible()) {
      console.log('   Cookie popup found, closing...');
      await cookieButton.click();
      await page.waitForTimeout(500);
      console.log('   ✓ Cookie popup closed');
    } else {
      console.log('   ✓ No Cookie popup');
    }
    
    // Step 3: Fill login form
    console.log('3. Filling login form...');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    console.log('   ✓ Form filled');
    
    // Step 4: Submit form
    console.log('4. Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Step 5: Wait for navigation
    console.log('5. Waiting for login completion...');
    
    // Wait for URL to change
    try {
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
      console.log(`   ✓ URL changed to: ${page.url()}`);
    } catch {
      // Check if we're still on login page
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('   ⚠ Still on login page, checking for errors...');
        
        // Check for error messages
        const errorText = await page.evaluate(() => {
          const errorEl = document.querySelector('[class*="error"], [class*="Error"], .text-red-500, .text-red-600');
          return errorEl?.textContent?.trim() || 'No error message found';
        });
        console.log(`   Error: ${errorText}`);
        
        // Check page content
        const pageText = await page.evaluate(() => document.body.innerText.substring(0, 300));
        console.log(`   Page: ${pageText}`);
        
        throw new Error('Login failed - URL did not change');
      }
    }
    
    // Step 6: Verify session
    console.log('6. Verifying session...');
    const sessionData = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        return { status: res.status, data };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('   Session:', JSON.stringify(sessionData, null, 2));
    
    if (sessionData.status === 200 && sessionData.data?.user) {
      console.log('   ✓ Session verified');
      console.log(`   ✓ User: ${sessionData.data.user.email}`);
    } else {
      console.log('   ✗ Session verification failed');
      process.exit(1);
    }
    
    // Step 7: Save storageState
    console.log('7. Saving storageState...');
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`   ✓ storageState saved`);
    
    const savedState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
    console.log(`   ✓ Cookies: ${savedState.cookies?.length || 0}`);
    
    console.log('\n=== Step 2 Complete ===');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: '/tmp/login-final-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/login-final-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
