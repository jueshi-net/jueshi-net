/**
 * v1.20.42.6.46.8 - Step 2 (React): Login via React Form Handler
 * 
 * 关键发现：登录表单由 React 组件处理，不是传统表单提交
 * 解决方案：使用 React 的方式触发登录
 */

import { chromium } from 'playwright';
import fs from 'fs';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Step 2 (React): Login via React Form Handler ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor all requests
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
    
    // Step 2: Close Cookie popup
    console.log('2. Closing Cookie popup...');
    const cookieButton = await page.locator('button:has-text("我知道了")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      await page.waitForTimeout(500);
      console.log('   ✓ Cookie popup closed');
    }
    
    // Step 3: Fill form using React-friendly way
    console.log('3. Filling form...');
    
    // Use type() instead of fill() to trigger React's onChange
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    
    await emailInput.click();
    await emailInput.type(TEST_EMAIL, { delay: 10 });
    
    await passwordInput.click();
    await passwordInput.type(TEST_PASSWORD, { delay: 10 });
    
    console.log('   ✓ Form filled (using type() for React compatibility)');
    
    // Step 4: Submit form
    console.log('4. Submitting form...');
    
    // Try clicking the submit button
    const submitButton = await page.locator('button[type="submit"]:has-text("登录")').first();
    await submitButton.click();
    console.log('   ✓ Submit button clicked');
    
    // Step 5: Wait for response
    console.log('5. Waiting for login response...');
    
    // Wait for any API request
    try {
      await page.waitForResponse(response => 
        response.url().includes('/api/auth/callback') || 
        response.url().includes('/api/auth/session'),
        { timeout: 10000 }
      );
      console.log('   ✓ API response received');
    } catch {
      console.log('   ⚠ No API response detected');
    }
    
    // Wait a bit more
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    // Check session
    const sessionData = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        return { status: res.status, data };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('\n6. Session status:');
    console.log(JSON.stringify(sessionData, null, 2));
    
    if (sessionData.data?.user) {
      console.log('   ✓ Login successful!');
      console.log(`   ✓ User: ${sessionData.data.user.email}`);
      
      // Save storageState
      console.log('\n7. Saving storageState...');
      await context.storageState({ path: STORAGE_STATE_PATH });
      console.log('   ✓ storageState saved');
      
      const savedState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
      console.log(`   ✓ Cookies: ${savedState.cookies?.length || 0}`);
      
      console.log('\n=== Step 2 Complete ===');
    } else {
      console.log('   ✗ Login failed');
      
      // Check for error messages
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector('[class*="error"], [class*="Error"], .text-red-500, .text-red-600');
        return errorEl?.textContent?.trim() || 'No error message found';
      });
      console.log(`   Error: ${errorText}`);
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: '/tmp/login-react-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/login-react-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
