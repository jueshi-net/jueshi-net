/**
 * v1.20.42.6.46.8 - Step 2 (Admin): Login with Admin Account
 * 
 * 尝试使用管理员账号登录
 */

import { chromium } from 'playwright';
import fs from 'fs';

const ADMIN_EMAIL = '9833416@qq.com';
const ADMIN_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';
const STORAGE_STATE_PATH = '/tmp/playwright-auth-state.json';

async function main() {
  console.log('=== Step 2 (Admin): Login with Admin Account ===\n');
  console.log(`Email: ${ADMIN_EMAIL}\n`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor API requests
  page.on('request', request => {
    if (request.url().includes('/api/auth/callback')) {
      console.log(`→ ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/auth/callback')) {
      console.log(`← ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // Step 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    const csrfToken = await page.evaluate(async () => {
      const res = await fetch('/api/auth/csrf');
      const data = await res.json();
      return data.csrfToken;
    });
    
    console.log(`   ✓ CSRF token retrieved`);
    
    // Step 2: Close Cookie popup
    console.log('2. Closing Cookie popup...');
    const cookieButton = await page.locator('button:has-text("我知道了")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      await page.waitForTimeout(500);
      console.log('   ✓ Cookie popup closed');
    }
    
    // Step 3: Submit login
    console.log('3. Submitting login...');
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
      
      return {
        status: res.status,
        ok: res.ok,
        url: res.url,
      };
    }, { csrfToken, email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    
    console.log('   Login result:', JSON.stringify(loginResult, null, 2));
    
    // Check for error in URL
    if (loginResult.url.includes('error=')) {
      const errorMatch = loginResult.url.match(/error=([^&]+)/);
      const errorCode = errorMatch ? errorMatch[1] : 'unknown';
      console.log(`   ✗ Login failed with error: ${errorCode}`);
      process.exit(1);
    }
    
    // Step 4: Wait for session
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
      console.log(`   ✓ Role: ${sessionData.data.user.role || 'unknown'}`);
      
      // Step 6: Save storageState
      console.log('\n6. Saving storageState...');
      await context.storageState({ path: STORAGE_STATE_PATH });
      console.log('   ✓ storageState saved');
      
      const savedState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
      console.log(`   ✓ Cookies: ${savedState.cookies?.length || 0}`);
      
      console.log('\n=== Step 2 Complete ===');
    } else {
      console.log('   ✗ Session verification failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
