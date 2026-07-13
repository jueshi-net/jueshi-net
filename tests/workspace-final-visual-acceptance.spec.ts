import { test, expect } from '@playwright/test';

const STORAGE_STATE = './scripts/storage-state.json';
const BASE = 'https://i.jueshi.net';

const ROUTES = [
  { path: '/workspace', name: 'workspace' },
  { path: '/workspace/notifications', name: 'notifications' },
  { path: '/workspace/documents', name: 'documents' },
  { path: '/workspace/favorites', name: 'favorites' },
  { path: '/workspace/memos', name: 'memos' },
  { path: '/workspace/tasks', name: 'tasks' },
  { path: '/workspace/member', name: 'member' },
  { path: '/workspace/company-profiles', name: 'company-profiles' },
  { path: '/workspace/task-chains', name: 'task-chains' },
  { path: '/workspace/ad-entitlements', name: 'ad-entitlements' },
  { path: '/workspace/settings', name: 'settings' },
  { path: '/workspace/invites', name: 'invites' },
  { path: '/workspace/templates', name: 'templates' },
  { path: '/workspace/task-chains/shipping/new', name: 'shipping-new' },
  { path: '/workspace/products', name: 'products' },
];

// 只测试关键视口：mobile, desktop
const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

test.describe('Workspace Final Visual Acceptance', () => {
  test.use({ storageState: STORAGE_STATE });

  for (const route of ROUTES) {
    test.describe(route.name, () => {
      for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
        test(`${vpName} — visual check`, async ({ browser }) => {
          const context = await browser.newContext({
            viewport: vp,
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

          const response = await page.goto(`${BASE}${route.path}`, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
          });

          // 基础检查
          expect(page.url()).toContain(route.path);
          expect(response?.status()).toBe(200);

          const bodyText = await page.textContent('body');
          expect(bodyText).not.toContain('Internal Server Error');
          expect(bodyText).not.toContain('Application error');
          expect(bodyText).not.toContain('500 Internal Server Error');

          // 检查 Header 只出现一次
          const headers = page.locator('header');
          const headerCount = await headers.count();
          expect(headerCount).toBeLessThanOrEqual(1);

          // 检查 Bottom Nav 只出现一次（移动端）
          if (vpName === 'mobile') {
            const bottomNav = page.locator('nav.fixed.bottom-0, nav.sticky.bottom-0');
            const bottomNavCount = await bottomNav.count();
            expect(bottomNavCount).toBeLessThanOrEqual(1);
          }

          // 检查 Sidebar（桌面端）
          if (vpName === 'desktop') {
            const sidebar = page.locator('aside').first();
            await expect(sidebar).toBeVisible({ timeout: 10000 });
          }

          // Check RightRail (except for settings and shipping-new which intentionally hide it)
          if (vpName === 'desktop' && route.name !== 'settings' && route.name !== 'shipping-new') {
            const rightRail = page.locator('aside').nth(1);
            await expect(rightRail).toBeVisible({ timeout: 10000 });
          }

          // 检查横向滚动
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          expect(hasHorizontalScroll).toBe(false);

          // 检查 pageerror
          expect(pageErrors.length).toBe(0);

          // 检查 React error #31
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

          // 截图
          await page.screenshot({ 
            path: `test-results/visual-acceptance/${route.name}-${vpName}.png`,
            fullPage: false
          });

          await context.close();
        });
      }
    });
  }
});
