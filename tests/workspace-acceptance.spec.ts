import { test, expect } from '@playwright/test';

test.describe('UI V4 Workspace Mobile Polish 2 - Login State Acceptance', () => {
  test('task center desktop verification', async ({ browser }) => {
    // Create context with storage state
    const context = await browser.newContext({
      storageState: './scripts/storage-state-e2e.json'
    });
    const page = await context.newPage();
    
    await page.goto('https://i.jueshi.net/workspace/tasks');
    await page.waitForLoadState('networkidle');
    
    // Check we're not on login page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    expect(currentUrl).not.toContain('/login');
    
    // Check for NaN, undefined in visible text (not in JS code)
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('+NaN');
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('[object Object]');
    
    // Take screenshot
    await page.screenshot({ path: './tests/screenshots/task-center-desktop.png', fullPage: true });
    
    console.log('Task center desktop verification passed');
    await context.close();
  });

  test('task center mobile 390px', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: './scripts/storage-state-e2e.json',
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    await page.goto('https://i.jueshi.net/workspace/tasks');
    await page.waitForLoadState('networkidle');
    
    // Check we're not on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    // Take screenshot
    await page.screenshot({ path: './tests/screenshots/task-center-390px.png', fullPage: true });
    
    console.log('Task center 390px verification passed');
    await context.close();
  });

  test('task center mobile 430px', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: './scripts/storage-state-e2e.json',
      viewport: { width: 430, height: 932 }
    });
    const page = await context.newPage();
    
    await page.goto('https://i.jueshi.net/workspace/tasks');
    await page.waitForLoadState('networkidle');
    
    // Check we're not on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    // Take screenshot
    await page.screenshot({ path: './tests/screenshots/task-center-430px.png', fullPage: true });
    
    console.log('Task center 430px verification passed');
    await context.close();
  });

  test('documents page mobile', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: './scripts/storage-state-e2e.json',
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    await page.goto('https://i.jueshi.net/workspace/documents');
    await page.waitForLoadState('networkidle');
    
    // Check we're not on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    // Take screenshot
    await page.screenshot({ path: './tests/screenshots/documents-390px.png', fullPage: true });
    
    console.log('Documents page 390px verification passed');
    await context.close();
  });

  test('settings page mobile', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: './scripts/storage-state-e2e.json',
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    await page.goto('https://i.jueshi.net/workspace/settings');
    await page.waitForLoadState('networkidle');
    
    // Check we're not on login page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    // Take screenshot
    await page.screenshot({ path: './tests/screenshots/settings-390px.png', fullPage: true });
    
    console.log('Settings page 390px verification passed');
    await context.close();
  });
});
