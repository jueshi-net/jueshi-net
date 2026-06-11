/**
 * v1.20.42.6.46.8 - Step 2 (Direct): Login via signIn() Direct Call
 * 
 * 关键发现：登录使用 NextAuth 的 signIn() 函数
 * 解决方案：直接在页面上执行 JavaScript 调用 signIn()
 */

import { chromium } from 'playwright';
import fs from 'fs';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Step 2 (Direct): Login via signIn() Direct Call ===\n');
  
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
    
    // Step 2: Close Cookie popup
    console.log('2. Closing Cookie popup...');
    const cookieButton = await page.locator('button:has-text("我知道了")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      await page.waitForTimeout(500);
      console.log('   ✓ Cookie popup closed');
    }
    
    // Step 3: Call signIn() directly
    console.log('3. Calling signIn() directly...');
    const signInResult = await page.evaluate(async (credentials) => {
      // Import signIn from next-auth/react
      const { signIn } = await import('next-auth/react');
      
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });
      
      return result;
    }, { email: TEST_EMAIL, password: TEST_PASSWORD });
    
    console.log('   signIn() result:', JSON.stringify(signInResult, null, 2));
    
    if (signInResult?.error) {
      console.log('   ✗ Login failed:', signInResult.error);
      process.exit(1);
    }
    
    console.log('   ✓ signIn() called successfully');
    
    // Step 4: Wait for session to be set
    console.log('4. Waiting for session...');
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
    
    console.log('   Session:', JSON.stringify(sessionData, null, 2));
    
    if (sessionData.data?.user) {
      console.log('   ✓ Login successful!');
      console.log(`   ✓ User: ${sessionData.data.user.email}`);
      
      // Step 6: Save storageState
      console.log('\n6. Saving storageState...');
      await context.storageState({ path: STORAGE_STATE_PATH });
      console.log('   ✓ storageState saved');
      
      const savedState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
      console.log(`   ✓ Cookies: ${savedState.cookies?.length || 0}`);
      savedState.cookies?.forEach(c => {
        console.log(`     - ${c.name}`);
      });
      
      console.log('\n=== Step 2 Complete ===');
    } else {
      console.log('   ✗ Session verification failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: '/tmp/login-direct-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/login-direct-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
