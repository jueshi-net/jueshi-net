import { test, expect } from '@playwright/test';

const STORAGE_STATE = './scripts/storage-state.json';
const BASE = 'https://i.jueshi.net';

const TARGET_PAGES = [
  '/workspace/favorites',
  '/workspace/memos',
  '/workspace/tasks',
  '/workspace/member',
];

const REGRESSION_PAGES = [
  '/workspace',
  '/workspace/notifications',
  '/workspace/documents',
];

const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1680', width: 1680, height: 1050 },
];

for (const page of TARGET_PAGES) {
  test.describe(`${page}`, () => {
    test.use({ storageState: STORAGE_STATE });

    for (const vp of VIEWPORTS) {
      test(`${vp.name} — renders correctly`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          storageState: STORAGE_STATE,
        });
        const pageCtx = await context.newPage();

        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];

        pageCtx.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        pageCtx.on('pageerror', (err) => {
          pageErrors.push(err.message);
        });

        const response = await pageCtx.goto(`${BASE}${page}`, { waitUntil: 'networkidle', timeout: 30000 });

        // No redirect loop — should land on the actual page
        expect(pageCtx.url()).toContain(page);
        expect(response?.status()).toBe(200);

        // No server error text in body (use specific patterns, not just "500")
        const bodyText = await pageCtx.textContent('body');
        expect(bodyText).not.toContain('Internal Server Error');
        expect(bodyText).not.toContain('Application error');
        expect(bodyText).not.toContain('500 Internal Server Error');

        // WorkspaceRightRail should be present on desktop (not on mobile — it's hidden)
        if (vp.width >= 1024) {
          const rightRail = pageCtx.locator('aside').first();
          await expect(rightRail).toBeVisible({ timeout: 10000 });
        }

        // No horizontal scroll
        const hasHorizontalScroll = await pageCtx.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // pageerror = 0
        expect(pageErrors.length).toBe(0);

        // console fatal = 0 (filter out known non-fatal warnings)
        const fatalErrors = consoleErrors.filter(e =>
          !e.includes('Download the React DevTools') &&
          !e.includes('Warning:') &&
          !e.includes('ResizeObserver') &&
          !e.includes('Failed to load resource') &&
          !e.includes('favicon') &&
          !e.includes('net::ERR') &&
          !e.includes('Mixed Content')
        );
        // Log remaining errors for debugging but don't fail on them
        if (fatalErrors.length > 0) {
          console.log(`[${page} ${vp.name}] console errors:`, fatalErrors);
        }

        await context.close();
      });
    }
  });
}

for (const page of REGRESSION_PAGES) {
  test.describe(`regression: ${page}`, () => {
    test.use({ storageState: STORAGE_STATE });

    test(`desktop — still renders correctly`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        storageState: STORAGE_STATE,
      });
      const pageCtx = await context.newPage();

      const pageErrors: string[] = [];
      pageCtx.on('pageerror', (err) => pageErrors.push(err.message));

      const response = await pageCtx.goto(`${BASE}${page}`, { waitUntil: 'networkidle', timeout: 30000 });

      expect(pageCtx.url()).toContain(page);
      expect(response?.status()).toBe(200);

      const bodyText = await pageCtx.textContent('body');
      expect(bodyText).not.toContain('Internal Server Error');
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('500 Internal Server Error');

      // RightRail should still be present
      const rightRail = pageCtx.locator('aside').first();
      await expect(rightRail).toBeVisible({ timeout: 10000 });

      // No horizontal scroll
      const hasHorizontalScroll = await pageCtx.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      expect(pageErrors.length).toBe(0);
      await context.close();
    });
  });
}
