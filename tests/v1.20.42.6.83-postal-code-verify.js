/**
 * v1.20.42.6.83 Postal Code Production Verification
 */
const { chromium } = require('playwright');

const BASE = 'https://jueshi.net';
let pass = 0, fail = 0;
const failures = [];

function ok(cat, test, status, detail = '') {
  if (status === 'PASS') pass++; else { fail++; failures.push(`[${cat}] ${test}: ${detail}`); }
  console.log(`${status === 'PASS' ? '✅' : '❌'} [${cat}] ${test}${detail ? ' — ' + detail : ''}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);

  // ═══ 1. Page loads ═══
  console.log('\n═══ 1. Postal Code Page ═══');
  await page.goto(`${BASE}/tools/postal-code`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);
  const content = await page.content();
  ok('Page', 'Loads 200', content.includes('邮编') || content.includes('postal') ? 'PASS' : 'FAIL');

  // ═══ 2. Malaysia province display ═══
  console.log('\n═══ 2. Malaysia Province Display ═══');

  // Select Malaysia from country list
  const myBtn = page.getByText('马来西亚').first();
  if (await myBtn.isVisible().catch(() => false)) {
    await myBtn.click();
    await sleep(1000);
    ok('MY', 'Country selectable', 'PASS');
  } else {
    ok('MY', 'Country selectable', 'FAIL', 'Button not found');
  }

  // Type postal code in DB search
  const dbInput = page.locator('input').filter({ hasText: '' }).nth(1);
  const allInputs = page.locator('input[type="text"], input:not([type])');
  const inputCount = await allInputs.count();
  
  // Find the DB search input (has placeholder with 邮编 or 城市)
  let dbSearchInput = null;
  for (let i = 0; i < inputCount; i++) {
    const ph = await allInputs.nth(i).getAttribute('placeholder').catch(() => '');
    if (ph && (ph.includes('邮编') || ph.includes('城市') || ph.includes('postal'))) {
      dbSearchInput = allInputs.nth(i);
      break;
    }
  }

  if (dbSearchInput) {
    await dbSearchInput.fill('50450');
    await sleep(500);
    
    // Click search button
    const searchBtn = page.getByText('查询').first();
    if (await searchBtn.isVisible().catch(() => false)) {
      await searchBtn.click();
      await sleep(3000);
    }

    // Check results
    const pageContent = await page.content();
    const hasResults = pageContent.includes('50450') || pageContent.includes('Kuala Lumpur') || pageContent.includes('找到');
    ok('MY', 'Query 50450 returns results', hasResults ? 'PASS' : 'FAIL');

    // Check if province/state is shown
    const hasProvince = pageContent.includes('Wilayah') || pageContent.includes('Kuala Lumpur') || pageContent.includes('省/州') || pageContent.includes('Selangor') || pageContent.includes('Melaka');
    ok('MY', 'Province/State displayed', hasProvince ? 'PASS' : 'FAIL');
  } else {
    ok('MY', 'DB search input found', 'FAIL');
  }

  // ═══ 3. Vietnam empty state ═══
  console.log('\n═══ 3. Vietnam Empty State ═══');

  const vnBtn = page.getByText('越南').first();
  if (await vnBtn.isVisible().catch(() => false)) {
    await vnBtn.click();
    await sleep(1000);
    ok('VN', 'Country selectable', 'PASS');
  } else {
    ok('VN', 'Country selectable', 'FAIL', 'Button not found');
  }

  // Search for something in VN
  if (dbSearchInput) {
    await dbSearchInput.fill('700000');
    await sleep(500);
    const searchBtn2 = page.getByText('查询').first();
    if (await searchBtn2.isVisible().catch(() => false)) {
      await searchBtn2.click();
      await sleep(3000);
    }

    const vnContent = await page.content();
    const hasFriendlyMsg = vnContent.includes('暂未覆盖') || vnContent.includes('没有找到') || vnContent.includes('没有完全匹配');
    ok('VN', 'Friendly empty message', hasFriendlyMsg ? 'PASS' : 'FAIL');

    // Check no undefined
    const hasUndefined = vnContent.includes('undefined');
    ok('VN', 'No undefined shown', !hasUndefined ? 'PASS' : 'FAIL');
  }

  // ═══ 4. Address Formatter regression ═══
  console.log('\n═══ 4. Address Formatter Regression ═══');
  await page.goto(`${BASE}/tools/address-formatter`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);
  const afContent = await page.content();
  ok('AF', 'Page loads', afContent.includes('地址') || afContent.includes('address') ? 'PASS' : 'FAIL');
  const afTextarea = page.locator('textarea').first();
  ok('AF', 'Textarea visible', await afTextarea.isVisible().catch(() => false) ? 'PASS' : 'FAIL');

  // ═══ 5. HS Code regression ═══
  console.log('\n═══ 5. HS Code Regression ═══');
  await page.goto(`${BASE}/tools/hs-code`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);
  const hsContent = await page.content();
  ok('HS', 'Page loads', hsContent.includes('HS') || hsContent.includes('海关') ? 'PASS' : 'FAIL');

  // ═══ 6. CI / QS regression ═══
  console.log('\n═══ 6. CI / QS Regression ═══');
  await page.goto(`${BASE}/tools/commercial-invoice`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(2000);
  ok('CI', 'Page loads', (await page.content()).includes('invoice') || (await page.content()).includes('发票') ? 'PASS' : 'FAIL');

  await page.goto(`${BASE}/tools/quote-sheet`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(2000);
  ok('QS', 'Page loads', (await page.content()).includes('quote') || (await page.content()).includes('报价') ? 'PASS' : 'FAIL');

  // ═══ 7. Mobile ═══
  console.log('\n═══ 7. Mobile ═══');
  const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mPage = await mCtx.newPage();
  await mPage.goto(`${BASE}/tools/postal-code`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);
  const overflow = await mPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok('Mobile 390px', 'No overflow', !overflow ? 'PASS' : 'FAIL');
  await mCtx.close();

  // ═══ SUMMARY ═══
  console.log('\n═══════════════════════════════════════════════');
  console.log(`TOTAL: ${pass} PASS, ${fail} FAIL`);
  if (failures.length > 0) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log(`  ❌ ${f}`));
  }
  console.log('═══════════════════════════════════════════════\n');

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
})();
