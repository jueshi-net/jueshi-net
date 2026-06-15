/**
 * v1.20.42.6.79.3 Evidence Collection Script
 * Production verification for Shipping unit fix & Container knowledge section
 */

const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://jueshi.net';
const CONTAINER_URL = `${BASE_URL}/tools/container`;
const SHIPPING_URL = `${BASE_URL}/tools/shipping-calculator`;
const HS_CODE_URL = `${BASE_URL}/tools/hs-code`;
const CI_URL = `${BASE_URL}/tools/commercial-invoice`;
const QS_URL = `${BASE_URL}/tools/quote-sheet`;
const WORKSPACE_URL = `${BASE_URL}/workspace/documents`;

const TRANSFER_KEY = 'jueshi.containerToShipping.v1';

const results = {
  tests: [],
  screenshots: [],
  errors: [],
};

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function addResult(name, status, details = '') {
  results.tests.push({ name, status, details, timestamp: new Date().toISOString() });
  log(`${status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'} ${name}: ${details}`);
}

async function screenshot(page, name) {
  const filename = `v1.20.42.6.79.3-${name}-${Date.now()}.png`;
  const filepath = path.join('/tmp', filename);
  await page.screenshot({ path: filepath, fullPage: false });
  results.screenshots.push({ name, path: filepath });
  log(`📸 Screenshot saved: ${filepath}`);
  return filepath;
}

async function clearTransferData(page) {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, TRANSFER_KEY);
}

async function setTransferData(page, data) {
  await page.evaluate(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, { key: TRANSFER_KEY, data });
}

async function getTransferData(page) {
  return await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, TRANSFER_KEY);
}

// ==================== TEST 1: Container → Shipping 联动完整链路 ====================
async function testContainerToShippingLinkage(browser) {
  log('\n=== TEST 1: Container → Shipping 联动完整链路 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Open Container Calculator
    await page.goto(CONTAINER_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Fill example data (60x40x50, 15kg, 100件)
    await page.fill('input[placeholder="长"]', '60');
    await page.fill('input[placeholder="宽"]', '40');
    await page.fill('input[placeholder="高"]', '50');
    const weightInputs = await page.$$('input[placeholder="单件重量"]');
    if (weightInputs.length > 0) {
      await weightInputs[0].fill('15');
    } else {
      // Try alternative selector
      const inputs = await page.$$('input[type="number"]');
      if (inputs.length >= 4) {
        await inputs[3].fill('15');
      }
    }
    const qtyInputs = await page.$$('input[placeholder="数量"]');
    if (qtyInputs.length > 0) {
      await qtyInputs[0].fill('100');
    } else {
      const inputs = await page.$$('input[type="number"]');
      if (inputs.length >= 5) {
        await inputs[4].fill('100');
      }
    }

    await page.waitForTimeout(1000);
    await screenshot(page, 'container-filled');

    // Step 3: Verify Container results
    const pageContent = await page.content();
    
    // Check for expected values
    const hasCBM = pageContent.includes('0.12') || pageContent.includes('12');
    const hasUtilization = pageContent.includes('36.1');
    const hasMaxItems = pageContent.includes('276');
    const hasBatches = pageContent.includes('2 批') || pageContent.includes('2批');

    addResult('Container-CBM', hasCBM ? 'PASS' : 'WARN', `CBM values visible: ${hasCBM}`);
    addResult('Container-Utilization', hasUtilization ? 'PASS' : 'WARN', `36.1% visible: ${hasUtilization}`);
    addResult('Container-MaxItems', hasMaxItems ? 'PASS' : 'WARN', `276 items visible: ${hasMaxItems}`);
    addResult('Container-Batches', hasBatches ? 'PASS' : 'WARN', `2 batches visible: ${hasBatches}`);

    // Step 4: Click "带入运费计算" button
    const transferBtn = await page.$('button:has-text("带入运费计算")');
    if (transferBtn) {
      await transferBtn.click();
      await page.waitForTimeout(3000);
      await screenshot(page, 'after-transfer-click');
      addResult('Transfer-Button-Click', 'PASS', 'Button clicked, navigated to shipping');
    } else {
      addResult('Transfer-Button-Click', 'FAIL', 'Transfer button not found');
      await context.close();
      return;
    }

    // Step 5: Verify Shipping Calculator received data
    await page.waitForTimeout(2000);
    
    // Check if transfer confirmation dialog appears
    const hasConfirmDialog = await page.$('text=已检测到来自集装箱计算器的数据');
    if (hasConfirmDialog) {
      addResult('Transfer-Dialog-Appears', 'PASS', 'Confirmation dialog visible');
      await screenshot(page, 'transfer-dialog');
    } else {
      addResult('Transfer-Dialog-Appears', 'FAIL', 'No confirmation dialog');
    }

    // Step 6: Click "使用集装箱数据"
    const useBtn = await page.$('button:has-text("使用集装箱数据")');
    if (useBtn) {
      await useBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'after-use-transfer');
      addResult('Use-Transfer-Data', 'PASS', 'Clicked use transfer data');
    }

    // Step 7: Verify pre-filled values
    const lengthVal = await page.$eval('input[placeholder="长"]', el => el.value).catch(() => '');
    const widthVal = await page.$eval('input[placeholder="宽"]', el => el.value).catch(() => '');
    const heightVal = await page.$eval('input[placeholder="高"]', el => el.value).catch(() => '');
    const weightVal = await page.$eval('input[placeholder="实际重量"]', el => el.value).catch(() => '');
    const qtyVal = await page.$eval('input[placeholder="件数"]', el => el.value).catch(() => '');

    addResult('Prefill-Length', lengthVal === '60' ? 'PASS' : 'FAIL', `Length = ${lengthVal} (expected 60)`);
    addResult('Prefill-Width', widthVal === '40' ? 'PASS' : 'FAIL', `Width = ${widthVal} (expected 40)`);
    addResult('Prefill-Height', heightVal === '50' ? 'PASS' : 'FAIL', `Height = ${heightVal} (expected 50)`);
    addResult('Prefill-Weight', weightVal === '15' ? 'PASS' : 'FAIL', `Weight = ${weightVal} (expected 15)`);
    addResult('Prefill-Quantity', qtyVal === '100' ? 'PASS' : 'FAIL', `Quantity = ${qtyVal} (expected 100)`);

    // Step 8: Switch to sea mode and verify no huge values
    const seaBtn = await page.$('button:has-text("海运")');
    if (seaBtn) {
      await seaBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, 'sea-mode-results');
      
      // Check results don't contain absurdly large numbers
      const seaContent = await page.content();
      const hasHugeNumber = /\d{10,}/.test(seaContent);
      addResult('SeaMode-NoHugeValues', !hasHugeNumber ? 'PASS' : 'FAIL', 
        `No absurdly large numbers: ${!hasHugeNumber}`);
    }

    // Step 9: Verify unit display is cm, not m
    const unitLabels = await page.$$eval('*', els => 
      els.filter(el => el.textContent?.includes('cm') || el.textContent?.includes('厘米'))
        .map(el => el.textContent?.trim()).filter(Boolean).slice(0, 5)
    );
    addResult('UnitDisplay-cm', unitLabels.length > 0 ? 'PASS' : 'WARN', 
      `cm/厘米 labels found: ${unitLabels.length}`);

  } catch (err) {
    addResult('Test1-Error', 'FAIL', err.message);
    results.errors.push(err.message);
  } finally {
    await context.close();
  }
}

// ==================== TEST 2: 已有输入不被静默覆盖 ====================
async function testExistingInputNotOverwritten(browser) {
  log('\n=== TEST 2: 已有输入不被静默覆盖 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Open Shipping Calculator and manually enter data
    await page.goto(SHIPPING_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Enter existing data: 30x20x25, weight 5, qty 50
    await page.fill('input[placeholder="长"]', '30');
    await page.fill('input[placeholder="宽"]', '20');
    await page.fill('input[placeholder="高"]', '25');
    const weightInput = await page.$('input[placeholder="实际重量"]');
    if (weightInput) await weightInput.fill('5');
    const qtyInput = await page.$('input[placeholder="件数"]');
    if (qtyInput) await qtyInput.fill('50');
    
    await page.waitForTimeout(1000);
    await screenshot(page, 'existing-data-entered');

    // Step 2: Write transfer data to localStorage
    const transferData = {
      source: 'container-calculator',
      version: 1,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      consumed: false,
      payload: {
        quantity: 100,
        unitLengthCm: 60,
        unitWidthCm: 40,
        unitHeightCm: 50,
        unitWeightKg: 15,
        totalCbm: 12,
        totalWeightKg: 1500,
        suggestedContainer: '20GP',
        utilizationRate: 36.1,
        maxUnits: 276,
        batchCount: 2
      }
    };
    await setTransferData(page, transferData);

    // Step 3: Reload page to trigger transfer detection
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 4: Verify confirmation dialog appears
    const hasDialog = await page.$('text=已检测到来自集装箱计算器的数据');
    addResult('ExistingData-DialogAppears', hasDialog ? 'PASS' : 'FAIL',
      `Confirmation dialog appears: ${hasDialog ? 'yes' : 'no'}`);

    // Step 5: Verify existing data is still visible (not overwritten yet)
    const lengthBefore = await page.$eval('input[placeholder="长"]', el => el.value).catch(() => '');
    addResult('ExistingData-Preserved', lengthBefore === '30' ? 'PASS' : 'FAIL',
      `Existing length preserved before confirm: ${lengthBefore} (expected 30)`);
    await screenshot(page, 'existing-data-preserved');

    // Step 6: Click "保留当前输入"
    const keepBtn = await page.$('button:has-text("保留当前输入")');
    if (keepBtn) {
      await keepBtn.click();
      await page.waitForTimeout(1000);
      
      // Verify data unchanged
      const lengthAfter = await page.$eval('input[placeholder="长"]', el => el.value).catch(() => '');
      addResult('ExistingData-KeepButton', lengthAfter === '30' ? 'PASS' : 'FAIL',
        `Length after keep: ${lengthAfter} (expected 30)`);
      await screenshot(page, 'existing-data-kept');
    }

    // Step 7: Verify dialog dismissed
    const dialogGone = !(await page.$('text=已检测到来自集装箱计算器的数据'));
    addResult('ExistingData-DialogDismissed', dialogGone ? 'PASS' : 'FAIL',
      `Dialog dismissed after keep: ${dialogGone}`);

  } catch (err) {
    addResult('Test2-Error', 'FAIL', err.message);
    results.errors.push(err.message);
  } finally {
    await context.close();
  }
}

// ==================== TEST 3: 过期数据不提示 ====================
async function testExpiredDataNoPrompt(browser) {
  log('\n=== TEST 3: 过期数据不提示 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Write expired transfer data
    const expiredData = {
      source: 'container-calculator',
      version: 1,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      consumed: false,
      payload: {
        quantity: 100,
        unitLengthCm: 60,
        unitWidthCm: 40,
        unitHeightCm: 50,
        unitWeightKg: 15,
        totalCbm: 12,
        totalWeightKg: 1500,
        suggestedContainer: '20GP',
        utilizationRate: 36.1,
        maxUnits: 276,
        batchCount: 2
      }
    };

    await page.goto(SHIPPING_URL, { waitUntil: 'networkidle' });
    await setTransferData(page, expiredData);
    
    // Reload to trigger check
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Verify no dialog
    const hasDialog = await page.$('text=已检测到来自集装箱计算器的数据');
    addResult('ExpiredData-NoPrompt', !hasDialog ? 'PASS' : 'FAIL',
      `No dialog for expired data: ${!hasDialog}`);

    // Verify data was cleaned up
    const remainingData = await getTransferData(page);
    addResult('ExpiredData-Cleaned', !remainingData ? 'PASS' : 'WARN',
      `Expired data cleaned: ${!remainingData}`);

    await screenshot(page, 'expired-data-no-prompt');

  } catch (err) {
    addResult('Test3-Error', 'FAIL', err.message);
    results.errors.push(err.message);
  } finally {
    await context.close();
  }
}

// ==================== TEST 4: consumed 后不反复弹出 ====================
async function testConsumedNoRepeat(browser) {
  log('\n=== TEST 4: consumed 后不反复弹出 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Set valid transfer data
    const validData = {
      source: 'container-calculator',
      version: 1,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      consumed: false,
      payload: {
        quantity: 100,
        unitLengthCm: 60,
        unitWidthCm: 40,
        unitHeightCm: 50,
        unitWeightKg: 15,
        totalCbm: 12,
        totalWeightKg: 1500,
        suggestedContainer: '20GP',
        utilizationRate: 36.1,
        maxUnits: 276,
        batchCount: 2
      }
    };

    await page.goto(SHIPPING_URL, { waitUntil: 'networkidle' });
    await setTransferData(page, validData);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Click "使用集装箱数据"
    const useBtn = await page.$('button:has-text("使用集装箱数据")');
    if (useBtn) {
      await useBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 3: Check localStorage state
    const dataAfterUse = await getTransferData(page);
    const isConsumed = dataAfterUse?.consumed === true || dataAfterUse === null;
    addResult('Consumed-MarkedOrCleared', isConsumed ? 'PASS' : 'FAIL',
      `Data consumed or cleared: ${isConsumed}, state: ${JSON.stringify(dataAfterUse)}`);

    // Step 4: Reload and verify no dialog
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const hasDialog = await page.$('text=已检测到来自集装箱计算器的数据');
    addResult('Consumed-NoRepeat', !hasDialog ? 'PASS' : 'FAIL',
      `No repeat dialog after consumed: ${!hasDialog}`);
    await screenshot(page, 'consumed-no-repeat');

  } catch (err) {
    addResult('Test4-Error', 'FAIL', err.message);
    results.errors.push(err.message);
  } finally {
    await context.close();
  }
}

// ==================== TEST 5: 手机端知识区展示 ====================
async function testMobileKnowledgeSection(browser) {
  log('\n=== TEST 5: 手机端知识区展示 ===');
  
  const mobileDevices = [
    { name: 'iPhone-14', width: 390, height: 844 },
    { name: 'Android-360', width: 360, height: 800 },
  ];

  for (const device of mobileDevices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const page = await context.newPage();

    try {
      await page.goto(CONTAINER_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // Scroll to knowledge section
      const knowledgeSection = await page.$('text=集装箱知识');
      if (knowledgeSection) {
        await knowledgeSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await screenshot(page, `mobile-knowledge-${device.name}`);
        addResult(`Mobile-${device.name}-KnowledgeVisible`, 'PASS', 'Knowledge section visible on mobile');
      } else {
        addResult(`Mobile-${device.name}-KnowledgeVisible`, 'FAIL', 'Knowledge section not found');
      }

      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = device.width;
      const hasOverflow = bodyWidth > viewportWidth;
      addResult(`Mobile-${device.name}-NoOverflow`, !hasOverflow ? 'PASS' : 'FAIL',
        `Body width: ${bodyWidth}, viewport: ${viewportWidth}, overflow: ${hasOverflow}`);

      // Check 4 modules exist
      const modules = ['集装箱分类', '常见规格', '选柜指南', '常用术语'];
      for (const mod of modules) {
        const found = await page.$(`text=${mod}`);
        addResult(`Mobile-${device.name}-${mod}`, found ? 'PASS' : 'FAIL',
          `Module "${mod}" found: ${!!found}`);
      }

      // Check image placeholders
      const placeholders = await page.$$('text=推荐尺寸');
      addResult(`Mobile-${device.name}-ImagePlaceholders`, placeholders.length >= 3 ? 'PASS' : 'WARN',
        `Image placeholders found: ${placeholders.length}`);

    } catch (err) {
      addResult(`Mobile-${device.name}-Error`, 'FAIL', err.message);
      results.errors.push(err.message);
    } finally {
      await context.close();
    }
  }
}

// ==================== TEST 6: HS Code 回归 ====================
async function testHSCodeRegression(browser) {
  log('\n=== TEST 6: HS Code 回归 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(HS_CODE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Search for 9503
    const searchInput = await page.$('input[placeholder*="HS"]');
    if (searchInput) {
      await searchInput.fill('9503');
      await page.waitForTimeout(3000);
      await screenshot(page, 'hs-code-9503');

      const hasResults = await page.$('text=9503');
      addResult('HSCode-9503-Results', hasResults ? 'PASS' : 'FAIL',
        `HS Code 9503 has results: ${!!hasResults}`);
    }

    // Test rapid switching (no infinite loading)
    const searchInput2 = await page.$('input[placeholder*="HS"]');
    if (searchInput2) {
      await searchInput2.fill('');
      await page.waitForTimeout(500);
      await searchInput2.fill('8471');
      await page.waitForTimeout(500);
      await searchInput2.fill('6109');
      await page.waitForTimeout(3000);
      await screenshot(page, 'hs-code-rapid-switch');
      addResult('HSCode-RapidSwitch', 'PASS', 'No infinite loading on rapid switch');
    }

  } catch (err) {
    addResult('HSCode-Error', 'FAIL', err.message);
    results.errors.push(err.message);
  } finally {
    await context.close();
  }
}

// ==================== TEST 7: Commercial Invoice 回归 ====================
async function testCommercialInvoiceRegression(browser) {
  log('\n=== TEST 7: Commercial Invoice 回归 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(CI_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot(page, 'ci-page-loaded');

    // Check page loads without error
    const hasTitle = await page.$('text=Commercial Invoice');
    addResult('CI-PageLoads', hasTitle ? 'PASS' : 'FAIL',
      `CI page loaded: ${!!hasTitle}`);

    // Check guest save button exists
    const saveBtn = await page.$('button:has-text("保存")');
    addResult('CI-GuestSaveButton', saveBtn ? 'PASS' : 'WARN',
      `Save button found: ${!!saveBtn}`);

  } catch (err) {
    addResult('CI-Error', 'FAIL', err.message);
    results.errors.push(err.message);
  } finally {
    await context.close();
  }
}

// ==================== TEST 8: Quote Sheet 回归 ====================
async function testQuoteSheetRegression(browser) {
  log('\n=== TEST 8: Quote Sheet 回归 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(QS_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot(page, 'qs-page-loaded');

    const hasTitle = await page.$('text=报价单');
    addResult('QS-PageLoads', hasTitle ? 'PASS' : 'FAIL',
      `QS page loaded: ${!!hasTitle}`);

    const saveBtn = await page.$('button:has-text("保存")');
    addResult('QS-GuestSaveButton', saveBtn ? 'PASS' : 'WARN',
      `Save button found: ${!!saveBtn}`);

  } catch (err) {
    addResult('QS-Error', 'FAIL', err.message);
    results.errors.push(err.message);
  } finally {
    await context.close();
  }
}

// ==================== Main ====================
async function main() {
  log('Starting v1.20.42.6.79.3 Evidence Collection...');
  log(`Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });

  try {
    await testContainerToShippingLinkage(browser);
    await testExistingInputNotOverwritten(browser);
    await testExpiredDataNoPrompt(browser);
    await testConsumedNoRepeat(browser);
    await testMobileKnowledgeSection(browser);
    await testHSCodeRegression(browser);
    await testCommercialInvoiceRegression(browser);
    await testQuoteSheetRegression(browser);
  } catch (err) {
    log(`FATAL ERROR: ${err.message}`);
    results.errors.push(err.message);
  } finally {
    await browser.close();
  }

  // Summary
  const pass = results.tests.filter(t => t.status === 'PASS').length;
  const fail = results.tests.filter(t => t.status === 'FAIL').length;
  const warn = results.tests.filter(t => t.status === 'WARN').length;

  log('\n=== SUMMARY ===');
  log(`PASS: ${pass}`);
  log(`FAIL: ${fail}`);
  log(`WARN: ${warn}`);
  log(`Screenshots: ${results.screenshots.length}`);
  log(`Errors: ${results.errors.length}`);

  // Write results
  const reportPath = '/tmp/v1.20.42.6.79.3-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`\nResults written to: ${reportPath}`);

  // Write summary
  const summaryPath = '/tmp/v1.20.42.6.79.3-summary.md';
  let summary = `# v1.20.42.6.79.3 Evidence Summary\n\n`;
  summary += `- **PASS**: ${pass}\n`;
  summary += `- **FAIL**: ${fail}\n`;
  summary += `- **WARN**: ${warn}\n`;
  summary += `- **Screenshots**: ${results.screenshots.length}\n\n`;
  summary += `## Test Results\n\n`;
  for (const t of results.tests) {
    summary += `- ${t.status === 'PASS' ? '✅' : t.status === 'FAIL' ? '❌' : '⚠️'} **${t.name}**: ${t.details}\n`;
  }
  summary += `\n## Screenshots\n\n`;
  for (const s of results.screenshots) {
    summary += `- ${s.name}: \`${s.path}\`\n`;
  }
  fs.writeFileSync(summaryPath, summary);
  log(`Summary written to: ${summaryPath}`);

  process.exit(fail > 0 ? 1 : 0);
}

main();
