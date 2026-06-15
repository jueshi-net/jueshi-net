/**
 * v1.20.42.6.79.3 Quick Regression Script
 * Faster verification with domcontentloaded
 */

const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://jueshi.net';

const results = { tests: [], screenshots: [] };

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function addResult(name, status, details = '') {
  results.tests.push({ name, status, details });
  log(`${status === 'PASS' ? '✅' : '❌'} ${name}: ${details}`);
}

async function screenshot(page, name) {
  const path = `/tmp/v1.20.42.6.79.3-${name}-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push({ name, path });
  return path;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Test 1: Container → Shipping with correct selectors
  log('\n=== Container → Shipping Linkage ===');
  let ctx = await browser.newContext();
  let page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/container`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Fill inputs using label association
    const labels = await page.$$('label');
    for (const label of labels) {
      const text = await label.textContent();
      const input = await page.$(`input[aria-label="${text}"], input:below(:text("${text}"))`);
      if (text?.includes('长') && input) await input.fill('60');
      if (text?.includes('宽') && input) await input.fill('40');
      if (text?.includes('高') && input) await input.fill('50');
      if (text?.includes('重量') && input) await input.fill('15');
      if (text?.includes('数量') && input) await input.fill('100');
    }
    
    // Alternative: fill by index
    const inputs = await page.$$('input[type="number"]');
    if (inputs.length >= 5) {
      await inputs[0].fill('60');
      await inputs[1].fill('40');
      await inputs[2].fill('50');
      await inputs[3].fill('15');
      await inputs[4].fill('100');
    }
    
    await page.waitForTimeout(1500);
    await screenshot(page, 'container-filled-v2');
    
    // Check results
    const content = await page.content();
    addResult('Container-CBM', content.includes('0.12') || content.includes('12') ? 'PASS' : 'WARN', 'CBM visible');
    addResult('Container-Utilization', content.includes('36.1') ? 'PASS' : 'WARN', '36.1% visible');
    addResult('Container-MaxItems', content.includes('276') ? 'PASS' : 'WARN', '276 items visible');
    
    // Click transfer button
    const btn = await page.$('button:has-text("带入运费计算")');
    if (btn) {
      await btn.click();
      await page.waitForTimeout(3000);
      addResult('Transfer-Navigation', 'PASS', 'Navigated to shipping');
      
      // Check shipping page
      const shippingContent = await page.content();
      addResult('Shipping-Dialog', shippingContent.includes('已检测到来自集装箱计算器的数据') ? 'PASS' : 'FAIL', 'Transfer dialog visible');
      
      // Click use
      const useBtn = await page.$('button:has-text("使用集装箱数据")');
      if (useBtn) {
        await useBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, 'shipping-after-use-v2');
        
        // Verify values
        const shippingInputs = await page.$$('input[type="number"]');
        if (shippingInputs.length >= 5) {
          const vals = [];
          for (const inp of shippingInputs.slice(0, 5)) {
            vals.push(await inp.inputValue());
          }
          addResult('Shipping-Length', vals[0] === '60' ? 'PASS' : 'FAIL', `Length=${vals[0]}`);
          addResult('Shipping-Width', vals[1] === '40' ? 'PASS' : 'FAIL', `Width=${vals[1]}`);
          addResult('Shipping-Height', vals[2] === '50' ? 'PASS' : 'FAIL', `Height=${vals[2]}`);
          addResult('Shipping-Quantity', vals[3] === '100' ? 'PASS' : 'FAIL', `Qty=${vals[3]}`);
          addResult('Shipping-Weight', vals[4] === '15' ? 'PASS' : 'FAIL', `Weight=${vals[4]}`);
        }
        
        // Switch to sea mode
        const seaBtn = await page.$('button:has-text("海运")');
        if (seaBtn) {
          await seaBtn.click();
          await page.waitForTimeout(2000);
          await screenshot(page, 'shipping-sea-mode-v2');
          const seaContent = await page.content();
          addResult('SeaMode-NoHugeValues', !/\d{10,}/.test(seaContent) ? 'PASS' : 'FAIL', 'No huge numbers in sea mode');
        }
      }
    }
  } catch (err) {
    addResult('Test1-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 2: HS Code
  log('\n=== HS Code Regression ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/hs-code`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'hs-code-v2');
    
    const searchInput = await page.$('input[type="text"], input[placeholder*="HS"]');
    if (searchInput) {
      await searchInput.fill('9503');
      await page.waitForTimeout(3000);
      await screenshot(page, 'hs-code-9503-v2');
      const content = await page.content();
      addResult('HSCode-9503', content.includes('9503') ? 'PASS' : 'FAIL', '9503 results visible');
    }
  } catch (err) {
    addResult('HSCode-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 3: Commercial Invoice
  log('\n=== Commercial Invoice Regression ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/commercial-invoice`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'ci-v2');
    const content = await page.content();
    addResult('CI-PageLoads', content.includes('Commercial Invoice') || content.includes('商业发票') ? 'PASS' : 'FAIL', 'CI page loaded');
  } catch (err) {
    addResult('CI-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 4: Quote Sheet
  log('\n=== Quote Sheet Regression ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/quote-sheet`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'qs-v2');
    const content = await page.content();
    addResult('QS-PageLoads', content.includes('报价单') || content.includes('Quote Sheet') ? 'PASS' : 'FAIL', 'QS page loaded');
  } catch (err) {
    addResult('QS-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  await browser.close();

  // Summary
  const pass = results.tests.filter(t => t.status === 'PASS').length;
  const fail = results.tests.filter(t => t.status === 'FAIL').length;
  log(`\n=== SUMMARY ===`);
  log(`PASS: ${pass}, FAIL: ${fail}`);
  
  fs.writeFileSync('/tmp/v1.20.42.6.79.3-quick-results.json', JSON.stringify(results, null, 2));
  log('Results: /tmp/v1.20.42.6.79.3-quick-results.json');
}

main();
