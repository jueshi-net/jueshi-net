import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = 'reports/ui-v4/screenshots';

test.describe('UI V4 Screenshots', () => {
  test('Desktop 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/ui-lab/jueshi-v4`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ui-v4-desktop-1440.png`, fullPage: true });
  });

  test('Desktop 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/ui-lab/jueshi-v4`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ui-v4-desktop-1280.png`, fullPage: true });
  });

  test('Tablet 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`${BASE_URL}/ui-lab/jueshi-v4`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ui-v4-tablet-1024.png`, fullPage: true });
  });

  test('Tablet 1024px with collapsed sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`${BASE_URL}/ui-lab/jueshi-v4`);
    await page.waitForLoadState('networkidle');
    // Click sidebar collapse button
    const collapseButton = page.locator('button:has(svg.lucide-chevrons-left), button:has(svg.lucide-chevrons-right)').first();
    if (await collapseButton.isVisible()) {
      await collapseButton.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ui-v4-collapsed-sidebar-1024.png`, fullPage: true });
  });

  test('Mobile 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/ui-lab/jueshi-v4`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ui-v4-mobile-390.png`, fullPage: true });
  });

  test('Mobile 390px with drawer open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/ui-lab/jueshi-v4`);
    await page.waitForLoadState('networkidle');
    // Click menu button to open drawer
    const menuButton = page.locator('button:has(svg.lucide-menu)').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ui-v4-mobile-drawer-390.png`, fullPage: true });
  });
});
