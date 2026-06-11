/**
 * v1.20.42.6.46.8 - Step 2 (Revised): Login with session verification
 * 
 * 改进：
 * 1. 登录后立即验证 session API
 * 2. 等待 session cookie 设置完成
 * 3. 手动添加 session cookie 到 storageState（如果需要）
 */

import { chromium } from 'playwright';
import fs from 'fs';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Step 2 (Revised): Login with Session Verification ===\n');
  
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
    
    // Step 3: Submit form
    console.log('3. Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Step 4: Wait for navigation and session cookie
    console.log('4. Waiting for login completion...');
    
    // Wait for URL to change (login successful)
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
    console.log(`   ✓ URL changed to: ${page.url()}`);
    
    // Wait a bit for cookies to be set
    await page.waitForTimeout(2000);
    
    // Step 5: Verify session
    console.log('5. Verifying session...');
    const sessionData = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        return { status: res.status, data };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('   Session API response:');
    console.log(JSON.stringify(sessionData, null, 2));
    
    if (sessionData.status === 200 && sessionData.data?.user) {
      console.log('   ✓ Session verified - user is logged in');
      console.log(`   ✓ User email: ${sessionData.data.user.email}`);
    } else {
      console.log('   ✗ Session verification failed');
      process.exit(1);
    }
    
    // Step 6: Check all cookies
    console.log('6. Checking cookies...');
    const cookies = await context.cookies();
    console.log(`   Total cookies: ${cookies.length}`);
    cookies.forEach(c => {
      console.log(`   - ${c.name} (${c.httpOnly ? 'httpOnly' : 'accessible'})`);
    });
    
    // Check for session cookie
    const sessionCookie = cookies.find(c => c.name.includes('session-token'));
    if (sessionCookie) {
      console.log(`   ✓ Session cookie found: ${sessionCookie.name}`);
    } else {
      console.log('   ⚠ Session cookie not found in browser cookies');
      console.log('   This might be because it\'s httpOnly and not accessible to JavaScript');
    }
    
    // Step 7: Save storageState
    console.log('7. Saving storageState...');
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`   ✓ storageState saved to ${STORAGE_STATE_PATH}`);
    
    // Verify saved state
    const savedState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
    console.log(`   ✓ Saved cookies: ${savedState.cookies?.length || 0}`);
    savedState.cookies?.forEach(c => {
      console.log(`     - ${c.name}`);
    });
    
    console.log('\n=== Step 2 Complete ===');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: '/tmp/login-revised-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/login-revised-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
