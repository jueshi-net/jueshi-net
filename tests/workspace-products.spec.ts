import { test, expect } from '@playwright/test';

const STORAGE_STATE = './scripts/storage-state.json';
const BASE = 'https://i.jueshi.net';

test.describe('/workspace/products', () => {
  test.use({ storageState: STORAGE_STATE });

  test('desktop-1440 — renders correctly', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      storageState: STORAGE_STATE,
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

    const response = await page.goto(`${BASE}/workspace/products`, { waitUntil: 'networkidle', timeout: 30000 });

    expect(page.url()).toContain('/workspace/products');
    expect(response?.status()).toBe(200);

    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Internal Server Error');
    expect(bodyText).not.toContain('Application error');
    expect(bodyText).not.toContain('500 Internal Server Error');

    const rightRail = page.locator('aside').first();
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

    await context.close();
  });

  test('mobile-390 — renders correctly', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      storageState: STORAGE_STATE,
    });
    const page = await context.newPage();

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const response = await page.goto(`${BASE}/workspace/products`, { waitUntil: 'networkidle', timeout: 30000 });

    expect(page.url()).toContain('/workspace/products');
    expect(response?.status()).toBe(200);

    expect(pageErrors.length).toBe(0);

    await context.close();
  });
});
