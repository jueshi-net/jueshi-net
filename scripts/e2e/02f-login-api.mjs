/**
 * v1.20.42.6.46.8 - Step 2 (API): Login via REST API
 * 
 * 使用 NextAuth REST API 直接登录
 */

import { chromium } from 'playwright';
import fs from 'fs';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Step 2 (API): Login via REST API ===\n');
  
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
    // Step 1: Navigate to any page to get CSRF token
    console.log('1. Getting CSRF token...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    const csrfToken = await page.evaluate(async () => {
      const res = await fetch('/api/auth/csrf');
      const data = await res.json();
      return data.csrfToken;
    });
    
    console.log(`   ✓ CSRF token: ${csrfToken?.substring(0, 20)}...`);
    
    // Step 2: Close Cookie popup
    console.log('2. Closing Cookie popup...');
    const cookieButton = await page.locator('button:has-text("我知道了")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      await page.waitForTimeout(500);
      console.log('   ✓ Cookie popup closed');
    }
    
    // Step 3: Submit login via REST API
    console.log('3. Submitting login via REST API...');
    const loginResult = await page.evaluate(async (credentials) => {
      const formData = new URLSearchParams();
      formData.append('csrfToken', credentials.csrfToken);
      formData.append('email', credentials.email);
      formData.append('password', credentials.password);
      formData.append('json', 'true');
      
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      const data = await res.json().catch(() => null);
      
      return {
        status: res.status,
        ok: res.ok,
        url: res.url,
        data,
      };
    }, { csrfToken, email: TEST_EMAIL, password: TEST_PASSWORD });
    
    console.log('   Login result:', JSON.stringify(loginResult, null, 2));
    
    if (!loginResult.ok) {
      console.log('   ✗ Login request failed');
      process.exit(1);
    }
    
    // Step 4: Wait for session cookie
    console.log('4. Waiting for session cookie...');
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
      
      // Check cookies
      const cookies = await context.cookies();
      console.log('\n   Current cookies:');
      cookies.forEach(c => {
        console.log(`     - ${c.name}`);
      });
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    await page.screenshot({ path: '/tmp/login-api-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/login-api-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
