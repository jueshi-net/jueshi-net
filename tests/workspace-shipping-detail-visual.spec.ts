import { test, expect } from '@playwright/test';

test.describe('Workspace Shipping Detail Visual Acceptance', () => {
  test.use({ storageState: './scripts/storage-state.json' });

  test('shipping detail mobile — visual check', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      storageState: './scripts/storage-state.json',
    });
    const page = await context.newPage();

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    const response = await page.goto('https://i.jueshi.net/workspace/task-chains/shipping/1', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    expect(page.url()).toContain('/workspace/task-chains/shipping/');
    expect(response?.status()).toBe(200);

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Internal Server Error');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('500 Internal Server Error');

    const headers = page.locator('header');
    const headerCount = await headers.count();
    expect(headerCount).toBeLessThanOrEqual(1);

    const bottomNav = page.locator('nav.fixed.bottom-0, nav.sticky.bottom-0');
    const bottomNavCount = await bottomNav.count();
    expect(bottomNavCount).toBeLessThanOrEqual(1);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    expect(pageErrors.length).toBe(0);

    const fatalErrors = consoleErrors.filter(e =>
      !e.includes('Download the React DevTools') &&
      !e.includes('Warning:') &&
      !e.includes('ResizeObserver') &&
      !e.includes('Failed to load resource') &&
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('Mixed Content')
    );
    
    const react31Errors = fatalErrors.filter(e => e.includes('Minified React error #31'));
    expect(react31Errors.length).toBe(0);

    await page.screenshot({ 
      path: 'test-results/visual-acceptance/shipping-detail-mobile.png',
      fullPage: false
    });

    await context.close();
  });

  test('shipping detail desktop — visual check', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      storageState: './scripts/storage-state.json',
    });
    const page = await context.newPage();

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    const response = await page.goto('https://i.jueshi.net/workspace/task-chains/shipping/1', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });

    expect(page.url()).toContain('/workspace/task-chains/shipping/');
    expect(response?.status()).toBe(200);

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Internal Server Error');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('500 Internal Server Error');

    const headers = page.locator('header');
    const headerCount = await headers.count();
    expect(headerCount).toBeLessThanOrEqual(1);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    const rightRail = page.locator('aside').nth(1);
    await expect(rightRail).toBeVisible({ timeout: 10000 });

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    expect(pageErrors.length).toBe(0);

    const fatalErrors = consoleErrors.filter(e =>
      !e.includes('Download the React DevTools') &&
      !e.includes('Warning:') &&
      !e.includes('ResizeObserver') &&
      !e.includes('Failed to load resource') &&
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('Mixed Content')
    );
    
    const react31Errors = fatalErrors.filter(e => e.includes('Minified React error #31'));
    expect(react31Errors.length).toBe(0);

    await page.screenshot({ 
      path: 'test-results/visual-acceptance/shipping-detail-desktop.png',
      fullPage: false
    });

    await context.close();
  });
});
