import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto("http://localhost:3058/services/e2e-service-1", { waitUntil: "domcontentloaded", timeout: 10000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: "artifacts/service-provider-round2b/service-detail.png", fullPage: false });
console.log("service-detail: SAVED");
await browser.close();
