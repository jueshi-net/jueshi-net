/**
 * Debug: Check NextAuth signIn function
 */

import { chromium } from 'playwright';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';

async function main() {
  console.log('=== Debug: NextAuth signIn ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  
  // Close cookie popup
  const cookieButton = await page.locator('button:has-text("我知道了")').first();
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
    await page.waitForTimeout(500);
  }
  
  // Check if signIn function is available
  const hasSignIn = await page.evaluate(() => {
    return typeof window.__NEXT_AUTH__ !== 'undefined' || 
           typeof window.nextauth !== 'undefined' ||
           typeof window.signIn !== 'undefined';
  });
  
  console.log('NextAuth functions available:', hasSignIn);
  
  // Check form structure
  const formInfo = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return null;
    return {
      action: form.action,
      method: form.method,
      hasEmail: !!form.querySelector('input[type="email"]'),
      hasPassword: !!form.querySelector('input[type="password"]'),
      submitButton: form.querySelector('button[type="submit"]')?.textContent?.trim(),
    };
  });
  
  console.log('\nForm info:');
  console.log(JSON.stringify(formInfo, null, 2));
  
  // Try to get CSRF token
  const csrfToken = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/auth/csrf');
      const data = await res.json();
      return data.csrfToken;
    } catch (e) {
      return null;
    }
  });
  
  console.log('\nCSRF Token:', csrfToken ? '✓ Retrieved' : '✗ Failed');
  
  // Try manual login via fetch
  console.log('\nAttempting manual login via fetch...');
  const loginResult = await page.evaluate(async (credentials) => {
    try {
      // Step 1: Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();
      
      // Step 2: Submit credentials
      const formData = new URLSearchParams();
      formData.append('csrfToken', csrfToken);
      formData.append('email', credentials.email);
      formData.append('password', credentials.password);
      
      const loginRes = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        redirect: 'manual',
      });
      
      return {
        status: loginRes.status,
        type: loginRes.type,
        url: loginRes.url,
        redirected: loginRes.redirected,
      };
    } catch (e) {
      return { error: e.message };
    }
  }, { email: TEST_EMAIL, password: TEST_PASSWORD });
  
  console.log('Login result:');
  console.log(JSON.stringify(loginResult, null, 2));
  
  // Check session after login
  await page.waitForTimeout(2000);
  const sessionAfter = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      return { status: res.status, data };
    } catch (e) {
      return { error: e.message };
    }
  });
  
  console.log('\nSession after login:');
  console.log(JSON.stringify(sessionAfter, null, 2));
  
  await browser.close();
}

main().catch(console.error);
