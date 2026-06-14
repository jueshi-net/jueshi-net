import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push({ text: msg.text(), location: msg.location() });
  }
});

console.log('=== Packing List Console Errors ===');
await page.goto('http://localhost:3000/tools/documents/packing-list');
await page.waitForLoadState('networkidle');
console.log(JSON.stringify(consoleErrors, null, 2));

consoleErrors.length = 0;
console.log('\n=== Proforma Invoice Console Errors ===');
await page.goto('http://localhost:3000/tools/documents/proforma-invoice');
await page.waitForLoadState('networkidle');
console.log(JSON.stringify(consoleErrors, null, 2));

consoleErrors.length = 0;
console.log('\n=== Container Console Errors ===');
await page.goto('http://localhost:3000/tools/container');
await page.waitForLoadState('networkidle');
console.log(JSON.stringify(consoleErrors, null, 2));

await browser.close();
