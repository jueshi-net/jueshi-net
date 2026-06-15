/**
 * v1.20.42.6.81 S2 Address Parser + Shipping Linkage Production Verification
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
  const path = `/tmp/v1.20.42.6.81-${name}-${Date.now()}.png`;
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push({ name, path });
  return path;
}

// Test address samples
const SAMPLES = {
  us: `John Smith
+1 650-555-0198
1600 Amphitheatre Parkway
Mountain View, CA 94043
United States`,
  canada: `Emily Chen
+1 416-555-0134
123 Queen St W
Toronto, ON M5H 2N2
Canada`,
  uk: `Alex Brown
+44 20 5555 0199
10 High Street
London SW1A 1AA
United Kingdom`,
  china: `张三
+86 138 0013 8000
中国 广东省 深圳市 南山区 科技园 科技南十二路 2 号
518000`,
};

async function main() {
  log('Starting v1.20.42.6.81 Production Verification...');
  const browser = await chromium.launch({ headless: true });

  // Test 1: Address Formatter page loads
  log('\n=== Test 1: Address Formatter Page ===');
  let ctx = await browser.newContext();
  let page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'address-formatter-page');
    
    const content = await page.content();
    addResult('AF-PageLoads', content.includes('粘贴地址自动解析') ? 'PASS' : 'FAIL', 'Parser section visible');
    addResult('AF-Textarea', content.includes('粘贴客户提供的完整收货地址') ? 'PASS' : 'FAIL', 'Textarea placeholder visible');
    
    // Check parser button exists
    const parseBtn = await page.$('button:has-text("解析地址")');
    addResult('AF-ParseButton', parseBtn ? 'PASS' : 'FAIL', 'Parse button found');
  } catch (err) {
    addResult('AF-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 2: Parse US address
  log('\n=== Test 2: Parse US Address ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill(SAMPLES.us);
      const parseBtn = await page.$('button:has-text("解析地址")');
      if (parseBtn) {
        await parseBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, 'us-address-parsed');
        
        const content = await page.content();
        addResult('US-Country', content.includes('United States') ? 'PASS' : 'FAIL', 'Country detected');
        addResult('US-City', content.includes('Mountain View') ? 'PASS' : 'FAIL', 'City detected');
        addResult('US-PostalCode', content.includes('94043') ? 'PASS' : 'FAIL', 'Postal code detected');
        addResult('US-Recipient', content.includes('John Smith') ? 'PASS' : 'FAIL', 'Recipient detected');
        addResult('US-Phone', content.includes('650') ? 'PASS' : 'FAIL', 'Phone detected');
      }
    }
  } catch (err) {
    addResult('US-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 3: Parse Canada address
  log('\n=== Test 3: Parse Canada Address ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill(SAMPLES.canada);
      const parseBtn = await page.$('button:has-text("解析地址")');
      if (parseBtn) {
        await parseBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, 'canada-address-parsed');
        
        const content = await page.content();
        addResult('CA-Country', content.includes('Canada') ? 'PASS' : 'FAIL', 'Country detected');
        addResult('CA-City', content.includes('Toronto') ? 'PASS' : 'FAIL', 'City detected');
        addResult('CA-PostalCode', content.includes('M5H') ? 'PASS' : 'FAIL', 'Postal code detected');
      }
    }
  } catch (err) {
    addResult('CA-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 4: Parse UK address
  log('\n=== Test 4: Parse UK Address ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill(SAMPLES.uk);
      const parseBtn = await page.$('button:has-text("解析地址")');
      if (parseBtn) {
        await parseBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, 'uk-address-parsed');
        
        const content = await page.content();
        addResult('UK-Country', content.includes('United Kingdom') ? 'PASS' : 'FAIL', 'Country detected');
        addResult('UK-City', content.includes('London') ? 'PASS' : 'FAIL', 'City detected');
        addResult('UK-PostalCode', content.includes('SW1A') ? 'PASS' : 'FAIL', 'Postal code detected');
      }
    }
  } catch (err) {
    addResult('UK-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 5: Parse China address
  log('\n=== Test 5: Parse China Address ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill(SAMPLES.china);
      const parseBtn = await page.$('button:has-text("解析地址")');
      if (parseBtn) {
        await parseBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, 'china-address-parsed');
        
        const content = await page.content();
        addResult('CN-Country', content.includes('中国') ? 'PASS' : 'FAIL', 'Country detected');
        addResult('CN-Recipient', content.includes('张三') ? 'PASS' : 'FAIL', 'Recipient detected');
        addResult('CN-PostalCode', content.includes('518000') ? 'PASS' : 'FAIL', 'Postal code detected');
      }
    }
  } catch (err) {
    addResult('CN-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 6: Copy buttons
  log('\n=== Test 6: Copy Buttons ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill(SAMPLES.us);
      const parseBtn = await page.$('button:has-text("解析地址")');
      if (parseBtn) {
        await parseBtn.click();
        await page.waitForTimeout(2000);
        
        const copyEnBtn = await page.$('button:has-text("复制英文地址")');
        const copyCnBtn = await page.$('button:has-text("复制中文地址")');
        const copyLineBtn = await page.$('button:has-text("复制分行格式")');
        
        addResult('Copy-EnglishButton', copyEnBtn ? 'PASS' : 'FAIL', 'Copy English button found');
        addResult('Copy-ChineseButton', copyCnBtn ? 'PASS' : 'FAIL', 'Copy Chinese button found');
        addResult('Copy-LineByLineButton', copyLineBtn ? 'PASS' : 'FAIL', 'Copy line-by-line button found');
      }
    }
  } catch (err) {
    addResult('Copy-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 7: Continue to Shipping button
  log('\n=== Test 7: Continue to Shipping ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill(SAMPLES.us);
      const parseBtn = await page.$('button:has-text("解析地址")');
      if (parseBtn) {
        await parseBtn.click();
        await page.waitForTimeout(2000);
        
        const shippingBtn = await page.$('button:has-text("继续计算运费")');
        addResult('Shipping-Button', shippingBtn ? 'PASS' : 'FAIL', 'Continue to shipping button found');
      }
    }
  } catch (err) {
    addResult('Shipping-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 8: Container → Shipping regression
  log('\n=== Test 8: Container → Shipping Regression ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/container`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const inputs = await page.$$('input[type="number"]');
    if (inputs.length >= 5) {
      await inputs[0].fill('60');
      await inputs[1].fill('40');
      await inputs[2].fill('50');
      await inputs[3].fill('15');
      await inputs[4].fill('100');
      await page.waitForTimeout(1500);
      
      const content = await page.content();
      addResult('Container-CBM', content.includes('0.12') || content.includes('12') ? 'PASS' : 'FAIL', 'CBM visible');
      addResult('Container-Utilization', content.includes('36.1') ? 'PASS' : 'FAIL', '36.1% visible');
      
      const transferBtn = await page.$('button:has-text("带入运费计算")');
      if (transferBtn) {
        await transferBtn.click();
        await page.waitForTimeout(3000);
        
        const shippingContent = await page.content();
        addResult('ContainerToShipping-Dialog', shippingContent.includes('已检测到来自集装箱计算器的数据') ? 'PASS' : 'FAIL', 'Transfer dialog visible');
      }
    }
  } catch (err) {
    addResult('Container-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 9: HS Code regression
  log('\n=== Test 9: HS Code Regression ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/hs-code`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const searchInput = await page.$('input[type="text"], input[placeholder*="HS"]');
    if (searchInput) {
      await searchInput.fill('9503');
      await page.waitForTimeout(3000);
      const content = await page.content();
      addResult('HSCode-9503', content.includes('9503') ? 'PASS' : 'FAIL', '9503 results visible');
    }
  } catch (err) {
    addResult('HSCode-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Test 10: Mobile viewport
  log('\n=== Test 10: Mobile Viewport ===');
  ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'mobile-address-formatter');
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    addResult('Mobile-NoOverflow', bodyWidth <= 390 ? 'PASS' : 'FAIL', `Body width: ${bodyWidth}`);
    
    const parserSection = await page.$('text=粘贴地址自动解析');
    addResult('Mobile-ParserVisible', parserSection ? 'PASS' : 'FAIL', 'Parser section visible on mobile');
  } catch (err) {
    addResult('Mobile-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  await browser.close();

  // Summary
  const pass = results.tests.filter(t => t.status === 'PASS').length;
  const fail = results.tests.filter(t => t.status === 'FAIL').length;
  log(`\n=== SUMMARY ===`);
  log(`PASS: ${pass}, FAIL: ${fail}`);
  
  fs.writeFileSync('/tmp/v1.20.42.6.81-results.json', JSON.stringify(results, null, 2));
  log('Results: /tmp/v1.20.42.6.81-results.json');
}

main();
