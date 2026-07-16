import { test, expect } from '@playwright/test';

test('login e2e-doc-user and save storage state', async ({ page }) => {
  await page.goto('https://i.jueshi.net/login');
  await page.fill('input[type="email"]', 'e2e-doc-user@jueshi.net');
  await page.fill('input[type="password"]', 'Test123456!');
  await page.click('button[type="submit"]');
  
  // Wait for navigation away from login
  await page.waitForURL('**/workspace**', { timeout: 10000 }).catch(() => 
    page.waitForURL('**/tools**', { timeout: 5000 })
  );
  
  // Check if login was successful
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);
  
  if (currentUrl.includes('/login')) {
    throw new Error('Login failed - still on login page');
  }
  
  // Save storage state
  const context = page.context();
  await context.storageState({ path: './scripts/storage-state-e2e.json' });
  
  console.log('Storage state saved successfully');
});
