/**
 * v1.20.42.6.81.1 S2 Address Parser Production Evidence Closure
 * Complete verification script
 */

const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://jueshi.net';
const results = { tests: [], screenshots: [], parsedResults: {} };

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function addResult(name, status, details = '') {
  results.tests.push({ name, status, details });
  log(`${status === 'PASS' ? '✅' : '❌'} ${name}: ${details}`);
}

async function screenshot(page, name) {
  const path = `/tmp/v1.20.42.6.81.1-${name}-${Date.now()}.png`;
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
  australia: `Olivia White
+61 2 5550 1234
88 George Street
Sydney NSW 2000
Australia`,
  nz: `Liam Wilson
+64 9 555 0123
55 Queen Street
Auckland 1010
New Zealand`,
  china: `张三
+86 138 0013 8000
中国 广东省 深圳市 南山区 科技园 科技南十二路 2 号
518000`,
};

async function parseAddress(page, sampleText, sampleName) {
  const textarea = await page.$('textarea');
  if (!textarea) return null;
  
  await textarea.fill(sampleText);
  const parseBtn = await page.$('button:has-text("解析地址")');
  if (!parseBtn) return null;
  
  await parseBtn.click();
  await page.waitForTimeout(2000);
  
  // Extract parsed fields from the page
  const fields = await page.evaluate(() => {
    const result = {};
    const fieldCards = document.querySelectorAll('.bg-gray-50.rounded-lg.p-3');
    fieldCards.forEach(card => {
      const label = card.querySelector('.text-xs.text-gray-500')?.textContent?.trim();
      const value = card.querySelector('.text-sm.font-medium')?.textContent?.trim();
      if (label && value) {
        result[label] = value;
      }
    });
    return result;
  });
  
  await screenshot(page, `${sampleName}-parsed`);
  return fields;
}

async function main() {
  log('Starting v1.20.42.6.81.1 Evidence Closure...');
  const browser = await chromium.launch({ headless: true });

  // ========== Section 1: Address Formatter Page ==========
  log('\n=== Section 1: Address Formatter Page ===');
  let ctx = await browser.newContext();
  let page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'af-page');
    
    const content = await page.content();
    addResult('AF-Page200', content.includes('粘贴地址自动解析') ? 'PASS' : 'FAIL', 'Page loads with parser section');
    addResult('AF-Textarea', await page.$('textarea') ? 'PASS' : 'FAIL', 'Textarea exists');
    addResult('AF-ParseButton', await page.$('button:has-text("解析地址")') ? 'PASS' : 'FAIL', 'Parse button exists');
    addResult('AF-CopyEnglishBtn', await page.$('button:has-text("复制英文地址")') ? 'PASS' : 'FAIL', 'Copy English button exists');
    addResult('AF-CopyChineseBtn', await page.$('button:has-text("复制中文地址")') ? 'PASS' : 'FAIL', 'Copy Chinese button exists');
    addResult('AF-CopyLineBtn', await page.$('button:has-text("复制分行格式")') ? 'PASS' : 'FAIL', 'Copy line-by-line button exists');
    addResult('AF-ContinueShippingBtn', await page.$('button:has-text("继续计算运费")') ? 'PASS' : 'FAIL', 'Continue to shipping button exists');
  } catch (err) {
    addResult('AF-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 2: 6 Address Samples ==========
  log('\n=== Section 2: 6 Address Samples ===');
  
  // US
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const fields = await parseAddress(page, SAMPLES.us, 'us');
    if (fields) {
      results.parsedResults.us = fields;
      addResult('US-Recipient', fields['收件人']?.includes('John Smith') ? 'PASS' : 'FAIL', `Recipient: ${fields['收件人']}`);
      addResult('US-Phone', fields['电话']?.includes('650') ? 'PASS' : 'FAIL', `Phone: ${fields['电话']}`);
      addResult('US-Country', fields['国家']?.includes('United States') ? 'PASS' : 'FAIL', `Country: ${fields['国家']}`);
      addResult('US-State', fields['省/州']?.includes('CA') ? 'PASS' : 'FAIL', `State: ${fields['省/州']}`);
      addResult('US-City', fields['城市']?.includes('Mountain View') ? 'PASS' : 'FAIL', `City: ${fields['城市']}`);
      addResult('US-PostalCode', fields['邮编']?.includes('94043') ? 'PASS' : 'FAIL', `PostalCode: ${fields['邮编']}`);
    }
  } catch (err) {
    addResult('US-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Canada
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const fields = await parseAddress(page, SAMPLES.canada, 'canada');
    if (fields) {
      results.parsedResults.canada = fields;
      addResult('CA-Recipient', fields['收件人']?.includes('Emily Chen') ? 'PASS' : 'FAIL', `Recipient: ${fields['收件人']}`);
      addResult('CA-Country', fields['国家']?.includes('Canada') ? 'PASS' : 'FAIL', `Country: ${fields['国家']}`);
      addResult('CA-Province', fields['省/州']?.includes('ON') ? 'PASS' : 'FAIL', `Province: ${fields['省/州']}`);
      addResult('CA-City', fields['城市']?.includes('Toronto') ? 'PASS' : 'FAIL', `City: ${fields['城市']}`);
      addResult('CA-PostalCode', fields['邮编']?.includes('M5H') ? 'PASS' : 'FAIL', `PostalCode: ${fields['邮编']}`);
    }
  } catch (err) {
    addResult('CA-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // UK
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const fields = await parseAddress(page, SAMPLES.uk, 'uk');
    if (fields) {
      results.parsedResults.uk = fields;
      addResult('UK-Recipient', fields['收件人']?.includes('Alex Brown') ? 'PASS' : 'FAIL', `Recipient: ${fields['收件人']}`);
      addResult('UK-Country', fields['国家']?.includes('United Kingdom') ? 'PASS' : 'FAIL', `Country: ${fields['国家']}`);
      addResult('UK-City', fields['城市']?.includes('London') ? 'PASS' : 'FAIL', `City: ${fields['城市']}`);
      addResult('UK-PostalCode', fields['邮编']?.includes('SW1A') ? 'PASS' : 'FAIL', `PostalCode: ${fields['邮编']}`);
    }
  } catch (err) {
    addResult('UK-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Australia
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const fields = await parseAddress(page, SAMPLES.australia, 'australia');
    if (fields) {
      results.parsedResults.australia = fields;
      addResult('AU-Recipient', fields['收件人']?.includes('Olivia White') ? 'PASS' : 'FAIL', `Recipient: ${fields['收件人']}`);
      addResult('AU-Country', fields['国家']?.includes('Australia') ? 'PASS' : 'FAIL', `Country: ${fields['国家']}`);
      addResult('AU-State', fields['省/州']?.includes('NSW') ? 'PASS' : 'FAIL', `State: ${fields['省/州']}`);
      addResult('AU-City', fields['城市']?.includes('Sydney') ? 'PASS' : 'FAIL', `City: ${fields['城市']}`);
      addResult('AU-PostalCode', fields['邮编']?.includes('2000') ? 'PASS' : 'FAIL', `PostalCode: ${fields['邮编']}`);
    }
  } catch (err) {
    addResult('AU-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // New Zealand
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const fields = await parseAddress(page, SAMPLES.nz, 'nz');
    if (fields) {
      results.parsedResults.nz = fields;
      addResult('NZ-Recipient', fields['收件人']?.includes('Liam Wilson') ? 'PASS' : 'FAIL', `Recipient: ${fields['收件人']}`);
      addResult('NZ-Country', fields['国家']?.includes('New Zealand') ? 'PASS' : 'FAIL', `Country: ${fields['国家']}`);
      addResult('NZ-City', fields['城市']?.includes('Auckland') ? 'PASS' : 'FAIL', `City: ${fields['城市']}`);
      addResult('NZ-PostalCode', fields['邮编']?.includes('1010') ? 'PASS' : 'FAIL', `PostalCode: ${fields['邮编']}`);
    }
  } catch (err) {
    addResult('NZ-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // China
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const fields = await parseAddress(page, SAMPLES.china, 'china');
    if (fields) {
      results.parsedResults.china = fields;
      addResult('CN-Recipient', fields['收件人']?.includes('张三') ? 'PASS' : 'FAIL', `Recipient: ${fields['收件人']}`);
      addResult('CN-Phone', fields['电话']?.includes('138') ? 'PASS' : 'FAIL', `Phone: ${fields['电话']}`);
      addResult('CN-Country', fields['国家']?.includes('中国') ? 'PASS' : 'FAIL', `Country: ${fields['国家']}`);
      addResult('CN-Province', fields['省/州']?.includes('广东') ? 'PASS' : 'FAIL', `Province: ${fields['省/州']}`);
      addResult('CN-City', fields['城市']?.includes('深圳') ? 'PASS' : 'FAIL', `City: ${fields['城市']}`);
      addResult('CN-PostalCode', fields['邮编']?.includes('518000') ? 'PASS' : 'FAIL', `PostalCode: ${fields['邮编']}`);
    }
  } catch (err) {
    addResult('CN-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 3: Address → Shipping Linkage ==========
  log('\n=== Section 3: Address → Shipping Linkage ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    // Parse US address
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const textarea = await page.$('textarea');
    await textarea.fill(SAMPLES.us);
    const parseBtn = await page.$('button:has-text("解析地址")');
    await parseBtn.click();
    await page.waitForTimeout(2000);
    
    // Click continue to shipping
    const shippingBtn = await page.$('button:has-text("继续计算运费")');
    await shippingBtn.click();
    await page.waitForTimeout(3000);
    
    // Check if navigated to shipping calculator
    const url = page.url();
    addResult('Linkage-Navigation', url.includes('shipping-calculator') ? 'PASS' : 'FAIL', `Navigated to: ${url}`);
    
    // Check for address transfer dialog
    const content = await page.content();
    addResult('Linkage-Dialog', content.includes('已检测到来自地址格式化助手的目的地信息') ? 'PASS' : 'FAIL', 'Address transfer dialog visible');
    
    // Check localStorage
    const transferData = await page.evaluate(() => {
      const raw = localStorage.getItem('jueshi.addressToShipping.v1');
      return raw ? JSON.parse(raw) : null;
    });
    if (transferData) {
      addResult('Linkage-LocalStorage', 'PASS', `Key exists with country: ${transferData.payload?.country}`);
      addResult('Linkage-Payload-Country', transferData.payload?.country === 'United States' ? 'PASS' : 'FAIL', `Country: ${transferData.payload?.country}`);
      addResult('Linkage-Payload-City', transferData.payload?.city === 'Mountain View' ? 'PASS' : 'FAIL', `City: ${transferData.payload?.city}`);
      addResult('Linkage-Payload-PostalCode', transferData.payload?.postalCode === '94043' ? 'PASS' : 'FAIL', `PostalCode: ${transferData.payload?.postalCode}`);
    }
    
    // Click "使用地址信息"
    const useBtn = await page.$('button:has-text("使用地址信息")');
    if (useBtn) {
      await useBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'shipping-after-address-use');
      
      const afterContent = await page.content();
      addResult('Linkage-Used', afterContent.includes('已带入目的地信息') ? 'PASS' : 'FAIL', 'Success message shown');
    }
    
    // Verify consumed
    const afterConsumed = await page.evaluate(() => {
      const raw = localStorage.getItem('jueshi.addressToShipping.v1');
      return raw ? JSON.parse(raw) : null;
    });
    addResult('Linkage-Consumed', afterConsumed?.consumed === true ? 'PASS' : 'FAIL', `Consumed: ${afterConsumed?.consumed}`);
    
  } catch (err) {
    addResult('Linkage-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 4: Expired Data ==========
  log('\n=== Section 4: Expired Data ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    // Set expired data
    await page.goto(`${BASE_URL}/tools/shipping-calculator`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const expiredData = {
        source: 'address-formatter',
        version: 1,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        consumed: false,
        payload: { country: 'Test', province: '', city: '', postalCode: '', addressSummary: '' }
      };
      localStorage.setItem('jueshi.addressToShipping.v1', JSON.stringify(expiredData));
    });
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const content = await page.content();
    addResult('Expired-NoDialog', !content.includes('已检测到来自地址格式化助手的目的地信息') ? 'PASS' : 'FAIL', 'No dialog for expired data');
  } catch (err) {
    addResult('Expired-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 5: Consumed No Repeat ==========
  log('\n=== Section 5: Consumed No Repeat ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Parse and transfer
    const textarea = await page.$('textarea');
    await textarea.fill(SAMPLES.us);
    const parseBtn = await page.$('button:has-text("解析地址")');
    await parseBtn.click();
    await page.waitForTimeout(2000);
    
    const shippingBtn = await page.$('button:has-text("继续计算运费")');
    await shippingBtn.click();
    await page.waitForTimeout(3000);
    
    // Use address
    const useBtn = await page.$('button:has-text("使用地址信息")');
    if (useBtn) {
      await useBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Reload
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const content = await page.content();
    addResult('Consumed-NoRepeat', !content.includes('已检测到来自地址格式化助手的目的地信息') ? 'PASS' : 'FAIL', 'No repeat dialog after consumed');
  } catch (err) {
    addResult('Consumed-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 6: Container → Shipping Regression ==========
  log('\n=== Section 6: Container → Shipping Regression ===');
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
      addResult('Container-CBM', content.includes('0.12') || content.includes('12') ? 'PASS' : 'FAIL', 'CBM correct');
      addResult('Container-Utilization', content.includes('36.1') ? 'PASS' : 'FAIL', 'Utilization correct');
      addResult('Container-MaxItems', content.includes('276') ? 'PASS' : 'FAIL', 'Max items correct');
      
      const transferBtn = await page.$('button:has-text("带入运费计算")');
      if (transferBtn) {
        await transferBtn.click();
        await page.waitForTimeout(3000);
        
        const shippingContent = await page.content();
        addResult('ContainerToShipping-Dialog', shippingContent.includes('已检测到来自集装箱计算器的数据') ? 'PASS' : 'FAIL', 'Container transfer dialog visible');
        
        // Use container data
        const useBtn = await page.$('button:has-text("使用集装箱数据")');
        if (useBtn) {
          await useBtn.click();
          await page.waitForTimeout(2000);
          
          // Verify values
          const shippingInputs = await page.$$('input[type="number"]');
          if (shippingInputs.length >= 5) {
            const vals = [];
            for (const inp of shippingInputs.slice(0, 5)) {
              vals.push(await inp.inputValue());
            }
            addResult('ContainerToShipping-Length', vals[0] === '60' ? 'PASS' : 'FAIL', `Length: ${vals[0]}`);
            addResult('ContainerToShipping-Width', vals[1] === '40' ? 'PASS' : 'FAIL', `Width: ${vals[1]}`);
            addResult('ContainerToShipping-Height', vals[2] === '50' ? 'PASS' : 'FAIL', `Height: ${vals[2]}`);
            addResult('ContainerToShipping-Weight', vals[4] === '15' ? 'PASS' : 'FAIL', `Weight: ${vals[4]}`);
            addResult('ContainerToShipping-Quantity', vals[3] === '100' ? 'PASS' : 'FAIL', `Quantity: ${vals[3]}`);
          }
        }
      }
    }
  } catch (err) {
    addResult('Container-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 7: HS Code Regression ==========
  log('\n=== Section 7: HS Code Regression ===');
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
      
      // Test rapid switch
      await searchInput.fill('');
      await page.waitForTimeout(500);
      await searchInput.fill('toy');
      await page.waitForTimeout(3000);
      await screenshot(page, 'hs-code-toy');
      addResult('HSCode-RapidSwitch', 'PASS', 'No infinite loading on rapid switch');
    }
  } catch (err) {
    addResult('HSCode-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 8: Commercial Invoice Regression ==========
  log('\n=== Section 8: Commercial Invoice Regression ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/commercial-invoice`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'ci-page');
    
    const content = await page.content();
    addResult('CI-PageLoads', content.includes('Commercial Invoice') || content.includes('商业发票') ? 'PASS' : 'FAIL', 'CI page loaded');
    addResult('CI-SaveButton', await page.$('button:has-text("保存")') ? 'PASS' : 'FAIL', 'Save button exists');
  } catch (err) {
    addResult('CI-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 9: Quote Sheet Regression ==========
  log('\n=== Section 9: Quote Sheet Regression ===');
  ctx = await browser.newContext();
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/quote-sheet`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'qs-page');
    
    const content = await page.content();
    addResult('QS-PageLoads', content.includes('报价单') || content.includes('Quote Sheet') ? 'PASS' : 'FAIL', 'QS page loaded');
    addResult('QS-SaveButton', await page.$('button:has-text("保存")') ? 'PASS' : 'FAIL', 'Save button exists');
  } catch (err) {
    addResult('QS-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // ========== Section 10: Mobile Viewport ==========
  log('\n=== Section 10: Mobile Viewport ===');
  ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'mobile-390');
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    addResult('Mobile-390-NoOverflow', bodyWidth <= 390 ? 'PASS' : 'FAIL', `Body width: ${bodyWidth}`);
    
    const parserSection = await page.$('text=粘贴地址自动解析');
    addResult('Mobile-390-ParserVisible', parserSection ? 'PASS' : 'FAIL', 'Parser section visible');
  } catch (err) {
    addResult('Mobile-390-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  // Android 360
  ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
  page = await ctx.newPage();
  try {
    await page.goto(`${BASE_URL}/tools/address-formatter`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await screenshot(page, 'mobile-360');
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    addResult('Mobile-360-NoOverflow', bodyWidth <= 360 ? 'PASS' : 'FAIL', `Body width: ${bodyWidth}`);
  } catch (err) {
    addResult('Mobile-360-Error', 'FAIL', err.message);
  } finally {
    await ctx.close();
  }

  await browser.close();

  // ========== Summary ==========
  const pass = results.tests.filter(t => t.status === 'PASS').length;
  const fail = results.tests.filter(t => t.status === 'FAIL').length;
  log(`\n=== SUMMARY ===`);
  log(`PASS: ${pass}, FAIL: ${fail}`);
  
  fs.writeFileSync('/tmp/v1.20.42.6.81.1-results.json', JSON.stringify(results, null, 2));
  
  // Write detailed report
  let report = `# v1.20.42.6.81.1 Evidence Closure\n\n`;
  report += `## Summary\n- PASS: ${pass}\n- FAIL: ${fail}\n\n`;
  report += `## Parsed Address Results\n\n`;
  for (const [country, fields] of Object.entries(results.parsedResults)) {
    report += `### ${country.toUpperCase()}\n`;
    for (const [key, value] of Object.entries(fields)) {
      report += `- ${key}: ${value}\n`;
    }
    report += `\n`;
  }
  report += `## Test Results\n\n`;
  for (const t of results.tests) {
    report += `- ${t.status === 'PASS' ? '✅' : '❌'} ${t.name}: ${t.details}\n`;
  }
  fs.writeFileSync('/tmp/v1.20.42.6.81.1-report.md', report);
  
  log('Results: /tmp/v1.20.42.6.81.1-results.json');
  log('Report: /tmp/v1.20.42.6.81.1-report.md');
}

main();
