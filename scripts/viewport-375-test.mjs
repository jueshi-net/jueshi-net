import { chromium } from 'playwright';
import fs from 'fs';

const results = {
  viewport: { width: 375, height: 812 },
  pages: {}
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await context.newPage();

// 收集 console errors
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

// 1. Packing List 验证
console.log('=== Packing List 375px 验证 ===');
await page.goto('http://localhost:3000/tools/documents/packing-list');
await page.waitForLoadState('networkidle');

const plBodyWidth = await page.evaluate(() => document.body.scrollWidth);
const plClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
const plHasOverflow = plBodyWidth > 390;

await page.screenshot({ path: 'reports/product-enhancement/pl-375px-viewport.png', fullPage: true });

results.pages['packing-list'] = {
  viewport: '375x812',
  'body.scrollWidth': plBodyWidth,
  'documentElement.clientWidth': plClientWidth,
  horizontal_overflow: plHasOverflow,
  console_errors: consoleErrors.length,
  screenshot: 'reports/product-enhancement/pl-375px-viewport.png'
};

console.log(`Body width: ${plBodyWidth}`);
console.log(`Client width: ${plClientWidth}`);
console.log(`Horizontal overflow: ${plHasOverflow}`);
console.log(`Console errors: ${consoleErrors.length}`);

// 2. Proforma Invoice 验证
console.log('\n=== Proforma Invoice 375px 验证 ===');
consoleErrors.length = 0;
await page.goto('http://localhost:3000/tools/documents/proforma-invoice');
await page.waitForLoadState('networkidle');

const piBodyWidth = await page.evaluate(() => document.body.scrollWidth);
const piClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
const piHasOverflow = piBodyWidth > 390;

await page.screenshot({ path: 'reports/product-enhancement/pi-375px-viewport.png', fullPage: true });

results.pages['proforma-invoice'] = {
  viewport: '375x812',
  'body.scrollWidth': piBodyWidth,
  'documentElement.clientWidth': piClientWidth,
  horizontal_overflow: piHasOverflow,
  console_errors: consoleErrors.length,
  screenshot: 'reports/product-enhancement/pi-375px-viewport.png'
};

console.log(`Body width: ${piBodyWidth}`);
console.log(`Client width: ${piClientWidth}`);
console.log(`Horizontal overflow: ${piHasOverflow}`);
console.log(`Console errors: ${consoleErrors.length}`);

// 3. Container 验证
console.log('\n=== Container 375px 验证 ===');
consoleErrors.length = 0;
await page.goto('http://localhost:3000/tools/container');
await page.waitForLoadState('networkidle');

const containerBodyWidth = await page.evaluate(() => document.body.scrollWidth);
const containerClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
const containerHasOverflow = containerBodyWidth > 390;

await page.screenshot({ path: 'reports/product-enhancement/container-375px-viewport.png', fullPage: true });

results.pages['container'] = {
  viewport: '375x812',
  'body.scrollWidth': containerBodyWidth,
  'documentElement.clientWidth': containerClientWidth,
  horizontal_overflow: containerHasOverflow,
  console_errors: consoleErrors.length,
  screenshot: 'reports/product-enhancement/container-375px-viewport.png'
};

console.log(`Body width: ${containerBodyWidth}`);
console.log(`Client width: ${containerClientWidth}`);
console.log(`Horizontal overflow: ${containerHasOverflow}`);
console.log(`Console errors: ${consoleErrors.length}`);

await browser.close();

// 保存结果
fs.writeFileSync(
  'reports/product-enhancement/375px-viewport-verification-results.json',
  JSON.stringify(results, null, 2)
);

console.log('\n=== 验证完成 ===');
console.log('结果已保存到 reports/product-enhancement/375px-viewport-verification-results.json');
console.log('截图已保存:');
console.log('  - reports/product-enhancement/pl-375px-viewport.png');
console.log('  - reports/product-enhancement/pi-375px-viewport.png');
console.log('  - reports/product-enhancement/container-375px-viewport.png');
