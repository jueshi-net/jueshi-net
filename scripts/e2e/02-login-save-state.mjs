/**
 * v1.20.42.6.46.8 - Step 2: Login and save storageState
 * 
 * 使用 Playwright 登录并保存 storageState，供后续测试复用。
 * 关键改进：不依赖 URL 变化，而是等待特定元素出现。
 */

import { chromium } from 'playwright';
import fs from 'fs';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Step 2: Login and Save storageState ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    console.log('   ✓ Login page loaded');
    
    // Step 2: Fill login form
    console.log('2. Filling login form...');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    console.log('   ✓ Form filled');
    
    // Step 3: Submit form and wait for successful login
    console.log('3. Submitting login form...');
    
    // Listen for API responses
    let loginSuccess = false;
    page.on('response', response => {
      if (response.url().includes('/api/auth/callback')) {
        console.log(`   → Auth callback: ${response.status()}`);
        if (response.status() === 200) loginSuccess = true;
      }
    });
    
    // Click submit button
    await page.click('button[type="submit"]');
    
    // Wait for navigation or element change (more reliable than URL)
    // Option 1: Wait for user-specific element to appear
    try {
      await page.waitForSelector('text=工作台', { timeout: 10000 });
      console.log('   ✓ Login successful (detected "工作台" element)');
    } catch {
      // Option 2: Wait for URL to change away from /login
      try {
        await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 5000 });
        console.log('   ✓ Login successful (URL changed)');
      } catch {
        // Option 3: Check if we're on a different page
        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          console.log(`   ✓ Login successful (current URL: ${currentUrl})`);
        } else {
          console.log('   ✗ Login may have failed, checking page content...');
          const pageContent = await page.content();
          if (pageContent.includes('退出') || pageContent.includes('登出')) {
            console.log('   ✓ Login successful (detected logout button)');
          } else {
            throw new Error('Login failed: no success indicators found');
          }
        }
      }
    }
    
    // Step 4: Save storageState
    console.log('4. Saving storageState...');
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`   ✓ storageState saved to ${STORAGE_STATE_PATH}`);
    
    // Verify storageState file
    const stateContent = fs.readFileSync(STORAGE_STATE_PATH, 'utf-8');
    const state = JSON.parse(stateContent);
    console.log(`   ✓ Cookies: ${state.cookies?.length || 0}`);
    console.log(`   ✓ Origins: ${state.origins?.length || 0}`);
    
    console.log('\n=== Step 2 Complete ===');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: '/tmp/login-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/login-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
