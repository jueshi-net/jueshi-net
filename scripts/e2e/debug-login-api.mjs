/**
 * Debug: Check login API response
 */

import { chromium } from 'playwright';

const TEST_EMAIL = 'test@jueshi.net';
const TEST_PASSWORD='***';
const BASE_URL = 'https://jueshi.net';

async function main() {
  console.log('=== Debug: Login API Response ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Monitor all network requests
  page.on('request', request => {
    if (request.url().includes('/api/auth')) {
      console.log(`→ ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/auth')) {
      console.log(`← ${response.status()} ${response.url()}`);
      try {
        const body = await response.text();
        console.log(`  Body: ${body.substring(0, 200)}`);
      } catch {}
    }
  });
  
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  
  console.log('\nFilling form...');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  
  console.log('Clicking submit...\n');
  await page.click('button[type="submit"]');
  
  // Wait for any response
  await page.waitForTimeout(5000);
  
  // Check current URL
  console.log(`\nCurrent URL: ${page.url()}`);
  
  // Check for error messages
  const errorText = await page.evaluate(() => {
    const errorEl = document.querySelector('[class*="error"], [class*="Error"], .text-red-500, .text-red-600');
    return errorEl?.textContent?.trim() || 'No error message found';
  });
  
  console.log(`Error message: ${errorText}`);
  
  // Check page content for clues
  const pageText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 500);
  });
  
  console.log(`\nPage text (first 500 chars):\n${pageText}`);
  
  await browser.close();
}

main().catch(console.error);
