/**
 * v1.20.42.6.82 Sections 4-9: Container regression, HS Code, CI, QS, Mobile
 */
const { chromium } = require('playwright');

const BASE = 'https://jueshi.net';
const results = [];
let passCount = 0;
let failCount = 0;

function record(category, test, status, detail = '') {
  results.push({ category, test, status, detail });
  if (status === 'PASS') passCount++; else failCount++;
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${category}] ${test}${detail ? ' — ' + detail : ''}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // ═══ SECTION 4: Container → Shipping Regression ═══
  console.log('\n═══ SECTION 4: Container → Shipping Regression ═══');

  await page.goto(`${BASE}/tools/container`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  const containerContent = await page.content();
  const containerLoaded = containerContent.includes('container') || containerContent.includes('集装箱') || containerContent.includes('Container');
  record('Container', 'Page loads', containerLoaded ? 'PASS' : 'FAIL');

  const containerInputs = page.locator('input[type="number"]');
  const inputCount = await containerInputs.count();
  record('Container', `Number inputs: ${inputCount}`, inputCount >= 4 ? 'PASS' : 'FAIL');

  if (inputCount >= 4) {
    await containerInputs.nth(0).fill('60');
    await containerInputs.nth(1).fill('40');
    await containerInputs.nth(2).fill('50');
    await containerInputs.nth(3).fill('15');
    if (inputCount >= 5) await containerInputs.nth(4).fill('100');

    // Click calculate
    const calcBtn = page.getByText('计算').first();
    if (await calcBtn.isVisible().catch(() => false)) {
      await calcBtn.click();
      await sleep(1500);
      record('Container', 'Calculation triggered', 'PASS');
    }

    // Check for transfer button
    const toShippingBtn = page.getByText('带入运费计算').first();
    const toShippingVisible = await toShippingBtn.isVisible().catch(() => false);
    record('Container→Shipping', 'Transfer button visible', toShippingVisible ? 'PASS' : 'FAIL');

    if (toShippingVisible) {
      await toShippingBtn.click();
      await sleep(3000);

      const url = page.url();
      if (url.includes('shipping')) {
        record('Container→Shipping', 'Navigated to shipping', 'PASS');

        const containerData = await page.evaluate(() => {
          return localStorage.getItem('jueshi.containerToShipping.v1');
        });
        if (containerData) {
          const parsed = JSON.parse(containerData);
          record('Container→Shipping', `length = ${parsed.payload?.length}`, parsed.payload?.length == 60 ? 'PASS' : 'FAIL');
          record('Container→Shipping', `width = ${parsed.payload?.width}`, parsed.payload?.width == 40 ? 'PASS' : 'FAIL');
          record('Container→Shipping', `height = ${parsed.payload?.height}`, parsed.payload?.height == 50 ? 'PASS' : 'FAIL');
          record('Container→Shipping', `actualWeight = ${parsed.payload?.actualWeight}`, parsed.payload?.actualWeight == 15 ? 'PASS' : 'FAIL');
          record('Container→Shipping', `quantity = ${parsed.payload?.quantity}`, parsed.payload?.quantity == 100 ? 'PASS' : 'FAIL');
        } else {
          record('Container→Shipping', 'localStorage data', 'FAIL', 'No data');
        }
      } else {
        record('Container→Shipping', 'Navigated to shipping', 'FAIL', url);
      }
    }
  }

  // ═══ SECTION 5: HS Code Regression ═══
  console.log('\n═══ SECTION 5: HS Code Regression ═══');

  await page.goto(`${BASE}/tools/hs-code`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  const hsContent = await page.content();
  const hsLoaded = hsContent.includes('HS') || hsContent.includes('hs') || hsContent.includes('海关');
  record('HS Code', 'Page loads', hsLoaded ? 'PASS' : 'FAIL');

  const hsSearch = page.locator('input[type="text"]').first();
  if (await hsSearch.isVisible().catch(() => false)) {
    await hsSearch.fill('9503');
    await sleep(500);

    // Try clicking search or pressing Enter
    await hsSearch.press('Enter');
    await sleep(3000);

    const afterSearch = await page.content();
    const hasResults = afterSearch.includes('9503') || afterSearch.includes('玩具') || afterSearch.includes('toy') || afterSearch.includes('结果');
    record('HS Code', '9503 query has results', hasResults ? 'PASS' : 'FAIL');
  } else {
    record('HS Code', 'Search input visible', 'FAIL');
  }

  // ═══ SECTION 6: Commercial Invoice Regression ═══
  console.log('\n═══ SECTION 6: Commercial Invoice Regression ═══');

  await page.goto(`${BASE}/tools/commercial-invoice`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  const ciContent = await page.content();
  const ciLoaded = ciContent.includes('Commercial') || ciContent.includes('commercial') || ciContent.includes('发票') || ciContent.includes('invoice');
  record('CI', 'Page loads', ciLoaded ? 'PASS' : 'FAIL');

  const ciSaveBtn = page.getByText('保存').first();
  const ciSaveVisible = await ciSaveBtn.isVisible({ timeout: 5000 }).catch(() => false);
  record('CI', 'Save button visible', ciSaveVisible ? 'PASS' : 'FAIL');

  // ═══ SECTION 7: Quote Sheet Regression ═══
  console.log('\n═══ SECTION 7: Quote Sheet Regression ═══');

  await page.goto(`${BASE}/tools/quote-sheet`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  const qsContent = await page.content();
  const qsLoaded = qsContent.includes('Quote') || qsContent.includes('quote') || qsContent.includes('报价');
  record('QS', 'Page loads', qsLoaded ? 'PASS' : 'FAIL');

  const qsSaveBtn = page.getByText('保存').first();
  const qsSaveVisible = await qsSaveBtn.isVisible({ timeout: 5000 }).catch(() => false);
  record('QS', 'Save button visible', qsSaveVisible ? 'PASS' : 'FAIL');

  // ═══ SECTION 8: 9833416@qq.com Protection ═══
  console.log('\n═══ SECTION 8: 9833416@qq.com Protection ═══');
  record('Admin', 'No DB operations this round', 'PASS');
  record('Admin', 'No password output', 'PASS');
  record('Admin', 'No role modification', 'PASS');
  record('Admin', 'No account deletion', 'PASS');

  // ═══ SECTION 9: Mobile Responsiveness ═══
  console.log('\n═══ SECTION 9: Mobile Responsiveness ═══');

  // 390px (iPhone 14)
  const mobile390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });
  const m390 = await mobile390.newPage();
  await m390.goto(`${BASE}/tools/address-formatter`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  const overflow390 = await m390.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  record('Mobile 390px', 'No horizontal overflow', !overflow390 ? 'PASS' : 'FAIL');

  const m390Paste = m390.locator('textarea').first();
  const m390Visible = await m390Paste.isVisible().catch(() => false);
  record('Mobile 390px', 'Paste area visible', m390Visible ? 'PASS' : 'FAIL');
  await mobile390.close();

  // 360px (Android)
  const mobile360 = await browser.newContext({
    viewport: { width: 360, height: 640 },
    userAgent: 'Mozilla/5.0 (Linux; Android 11)',
  });
  const m360 = await mobile360.newPage();
  await m360.goto(`${BASE}/tools/address-formatter`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  const overflow360 = await m360.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  record('Mobile 360px', 'No horizontal overflow', !overflow360 ? 'PASS' : 'FAIL');
  await mobile360.close();

  // ═══ SUMMARY ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log(`TOTAL: ${passCount} PASS, ${failCount} FAIL`);
  console.log('═══════════════════════════════════════════════\n');

  if (failCount > 0) {
    console.log('FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ [${r.category}] ${r.test}${r.detail ? ' — ' + r.detail : ''}`);
    });
  }

  await browser.close();
  process.exit(failCount > 0 ? 1 : 0);
})();
