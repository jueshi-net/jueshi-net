import { test, expect } from '@playwright/test';

test('generate fresh storage state', async ({ page }) => {
  await page.goto('https://i.jueshi.net/login');
  await page.fill('input[type="email"]', 'test@jueshi.net');
  await page.fill('input[type="password"]', 'Test123456!');
  await page.click('button[type="submit"]');
  // Wait for navigation away from login (could be /workspace, /tools, etc.)
  await page.waitForURL('**/tools**', { timeout: 15000 }).catch(() => 
    page.waitForURL('**/workspace**', { timeout: 5000 })
  );
  
  // Save storage state
  const context = page.context();
  await context.storageState({ path: './scripts/storage-state.json' });
  
  console.log('Storage state saved. Current URL:', page.url());
});
