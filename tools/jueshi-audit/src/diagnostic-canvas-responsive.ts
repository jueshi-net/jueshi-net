#!/usr/bin/env tsx
/**
 * Canvas Responsive Layout Diagnostic Screenshots
 * Capture screenshots at different viewports to identify layout issues
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.AUDIT_BASE_URL || "https://i.jueshi.net";
const TEST_EMAIL = process.env.AUDIT_TEST_EMAIL || "test@jueshi.net";
const TEST_PASSWORD_FILE = process.env.AUDIT_TEST_PASSWORD_FILE || "/tmp/staging_pwd.txt";
const SCREENSHOT_DIR = path.join(process.cwd(), "evidence", `canvas-responsive-${Date.now()}`);

// Viewport configurations
const VIEWPORTS = [
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "ipad-landscape", width: 1024, height: 768 },
  { name: "ipad-portrait", width: 768, height: 1024 },
  { name: "mobile-375", width: 375, height: 667 },
  { name: "mobile-390", width: 390, height: 844 },
];

async function main() {
  console.log("=== Canvas Responsive Layout Diagnostic ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Screenshot Dir: ${SCREENSHOT_DIR}`);
  console.log("");

  // Create screenshot directory
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  console.log("Logging in...");
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  const password = fs.readFileSync(TEST_PASSWORD_FILE, 'utf-8').trim();
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/tools**", { timeout: 10000 });
  console.log("✓ Logged in\n");

  // Go to canvas editor
  await page.goto(`${BASE_URL}/tools/template-studio/canvas/new`);
  await page.waitForSelector('[data-testid="canvas-editor-root"]', { timeout: 10000 });
  console.log("✓ Canvas editor loaded\n");

  // Add some elements to make the canvas more realistic
  await page.click('[data-testid="canvas-add-text"]');
  await page.click('[data-testid="canvas-add-field"]');
  await page.waitForTimeout(500);

  // Capture screenshots at different viewports
  for (const viewport of VIEWPORTS) {
    console.log(`Capturing ${viewport.name} (${viewport.width}x${viewport.height})...`);
    
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(1000); // Wait for layout to settle
    
    const screenshotPath = path.join(SCREENSHOT_DIR, `${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    // Check for horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    // Check if canvas is visible
    const canvasVisible = await page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="canvas-editor-root"]');
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    
    console.log(`  ✓ Screenshot saved: ${screenshotPath}`);
    console.log(`  Horizontal overflow: ${hasHorizontalOverflow ? "YES ⚠️" : "NO ✓"}`);
    console.log(`  Canvas visible: ${canvasVisible ? "YES ✓" : "NO ⚠️"}`);
    console.log("");
  }

  await browser.close();

  console.log("=== Diagnostic Complete ===");
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
}

main().catch(err => {
  console.error("Diagnostic failed:", err);
  process.exit(1);
});
