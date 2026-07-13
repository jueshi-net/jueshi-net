import { test, expect } from '@playwright/test';

const BASE_URL = 'https://i.jueshi.net/ui-lab/jueshi-v4';
const SCREENSHOT_DIR = 'reports/ui-v4-light/screenshots';

test.describe('UI V4 Light Theme Screenshots', () => {
  test('Desktop 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/desktop-1440px.png`, fullPage: false });
  });

  test('Desktop 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/desktop-1280px.png`, fullPage: false });
  });

  test('Tablet 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/tablet-1024px.png`, fullPage: false });
  });

  test('Mobile 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-390px.png`, fullPage: false });
  });

  test('Mobile menu open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    // Click menu button
    await page.click('button:has(svg)');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-menu-open.png`, fullPage: false });
  });

  test('Hero close-up', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const hero = page.locator('section').first();
    await hero.screenshot({ path: `${SCREENSHOT_DIR}/hero-closeup.png` });
  });

  test('Tools grid close-up', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    // Scroll to tools section
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    const toolsSection = page.locator('section').nth(2);
    await toolsSection.screenshot({ path: `${SCREENSHOT_DIR}/tools-grid-closeup.png` });
  });
});
