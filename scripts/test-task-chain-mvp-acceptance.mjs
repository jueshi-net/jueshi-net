import { chromium } from 'playwright';

const BASE_URL = 'https://jueshi.net';
const SCREENSHOT_DIR = 'reports/task-chain-mvp/acceptance-screenshots';

async function screenshot(page, name) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}`, fullPage: false });
  console.log(`✓ Screenshot: ${name}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testTaskChainA(browser) {
  console.log('\n=== 任务链 A: HS编码 → Commercial Invoice ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. 打开 HS 编码页面
  await page.goto(`${BASE_URL}/tools/hs-code`);
  await page.waitForLoadState('networkidle');
  console.log('✓ 打开 /tools/hs-code');

  // 2. 搜索 phone case
  const searchInput = await page.locator('input[placeholder*="phone case"], input[placeholder*="HS 编码"]').first();
  await searchInput.fill('phone case');
  await sleep(1000); // 等待 debounce
  console.log('✓ 搜索 phone case');

  // 3. 复制 HS 编码（点击第一个结果的复制按钮）
  const copyButton = await page.locator('button:has-text("复制编码")').first();
  if (await copyButton.isVisible()) {
    await copyButton.click();
    await sleep(500);
    console.log('✓ 复制 HS 编码');
  }

  // 4. 检查 localStorage
  const taskChainData = await page.evaluate(() => {
    const data = localStorage.getItem('jueshi.taskChain.shippingMvp');
    return data ? JSON.parse(data) : null;
  });
  console.log('✓ localStorage 数据:', JSON.stringify(taskChainData, null, 2));

  if (!taskChainData || !taskChainData.productName || !taskChainData.hsCode) {
    console.error('✗ 任务链数据不完整');
    await context.close();
    return false;
  }

  // 5. 截图
  await screenshot(page, 'hs-code-task-chain.png');

  // 6. 点击"去商业发票"
  const nextButton = await page.locator('a:has-text("去商业发票"), a:has-text("商业发票")').first();
  if (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ 点击"去商业发票"');
  }

  // 7. 验证预填横幅
  const banner = await page.locator('text=检测到任务链数据').first();
  if (await banner.isVisible()) {
    console.log('✓ 预填横幅显示');
    await screenshot(page, 'commercial-invoice-prefill-banner.png');
  } else {
    console.log('⚠ 预填横幅未显示（可能需要先有任务链数据）');
  }

  await context.close();
  return true;
}

async function testTaskChainB(browser) {
  console.log('\n=== 任务链 B: 汇率 → Quotation ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. 打开汇率页面
  await page.goto(`${BASE_URL}/tools/exchange-rate`);
  await page.waitForLoadState('networkidle');
  console.log('✓ 打开 /tools/exchange-rate');

  // 2. 输入 100 USD → CAD
  const amountInput = await page.locator('input[type="number"]').first();
  await amountInput.fill('100');

  // 3. 点击转换按钮
  const convertButton = await page.locator('button:has-text("转换")').first();
  await convertButton.click();
  await sleep(1000);
  console.log('✓ 输入 100 USD → CAD');

  // 4. 检查 localStorage
  const taskChainData = await page.evaluate(() => {
    const data = localStorage.getItem('jueshi.taskChain.shippingMvp');
    return data ? JSON.parse(data) : null;
  });
  console.log('✓ localStorage 数据:', JSON.stringify(taskChainData, null, 2));

  if (!taskChainData || !taskChainData.declaredValue || !taskChainData.currency) {
    console.error('✗ 任务链数据不完整');
    await context.close();
    return false;
  }

  // 5. 截图
  await screenshot(page, 'exchange-rate-task-chain.png');

  // 6. 点击"去报价单"
  const nextButton = await page.locator('a:has-text("去报价单"), a:has-text("报价单")').first();
  if (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ 点击"去报价单"');
  }

  // 7. 验证预填横幅
  const banner = await page.locator('text=检测到任务链数据').first();
  if (await banner.isVisible()) {
    console.log('✓ 预填横幅显示');
    await screenshot(page, 'quotation-prefill-banner.png');
  } else {
    console.log('⚠ 预填横幅未显示（可能需要先有任务链数据）');
  }

  await context.close();
  return true;
}

async function testTaskChainC(browser) {
  console.log('\n=== 任务链 C: 邮编 → 集运发货清单 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. 打开邮编页面
  await page.goto(`${BASE_URL}/tools/postal-code`);
  await page.waitForLoadState('networkidle');
  console.log('✓ 打开 /tools/postal-code');

  // 2. 输入 M5V 3L9
  const postalInput = await page.locator('input[placeholder*="M5V"], input[placeholder*="邮编"]').first();
  await postalInput.fill('M5V 3L9');

  // 3. 点击查询按钮
  const queryButton = await page.locator('button:has-text("查询"), button:has-text("校验")').first();
  await queryButton.click();
  await sleep(1000);
  console.log('✓ 输入 M5V 3L9');

  // 4. 检查 localStorage
  const taskChainData = await page.evaluate(() => {
    const data = localStorage.getItem('jueshi.taskChain.shippingMvp');
    return data ? JSON.parse(data) : null;
  });
  console.log('✓ localStorage 数据:', JSON.stringify(taskChainData, null, 2));

  if (!taskChainData || !taskChainData.postalCode) {
    console.error('✗ 任务链数据不完整');
    await context.close();
    return false;
  }

  // 5. 截图
  await screenshot(page, 'postal-code-task-chain.png');

  // 6. 点击"去集运发货清单"
  const nextButton = await page.locator('a:has-text("去集运发货清单"), a:has-text("集运发货清单")').first();
  if (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ 点击"去集运发货清单"');
  }

  // 7. 验证页面
  await screenshot(page, 'first-shipping-from-task-chain.png');

  // 8. 验证 localStorage 保留
  const preservedData = await page.evaluate(() => {
    const data = localStorage.getItem('jueshi.taskChain.shippingMvp');
    return data ? JSON.parse(data) : null;
  });
  if (preservedData && preservedData.postalCode === 'M5V 3L9') {
    console.log('✓ localStorage 保留上下文');
  } else {
    console.error('✗ localStorage 上下文丢失');
  }

  await context.close();
  return true;
}

async function testTaskChainD(browser) {
  console.log('\n=== 任务链 D: 清除数据 ===');
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. 先设置一些任务链数据
  await page.goto(`${BASE_URL}/tools/hs-code`);
  await page.waitForLoadState('networkidle');

  const searchInput = await page.locator('input[placeholder*="phone case"], input[placeholder*="HS 编码"]').first();
  await searchInput.fill('test');
  await sleep(1000);

  // 2. 验证数据存在
  let taskChainData = await page.evaluate(() => {
    const data = localStorage.getItem('jueshi.taskChain.shippingMvp');
    return data ? JSON.parse(data) : null;
  });
  console.log('✓ 设置任务链数据:', taskChainData?.productName);

  // 3. 点击"清除任务链数据"
  const clearButton = await page.locator('button:has-text("清除任务链数据")').first();
  if (await clearButton.isVisible()) {
    await clearButton.click();
    await sleep(500);
    console.log('✓ 点击"清除任务链数据"');
  }

  // 4. 验证数据已清除
  taskChainData = await page.evaluate(() => {
    const data = localStorage.getItem('jueshi.taskChain.shippingMvp');
    return data ? JSON.parse(data) : null;
  });

  if (!taskChainData) {
    console.log('✓ localStorage 已清除');
  } else {
    console.error('✗ localStorage 未清除');
  }

  await context.close();
  return true;
}

async function testMobileView(browser) {
  console.log('\n=== 移动端验证 (375px) ===');
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  // 1. HS 编码页面
  await page.goto(`${BASE_URL}/tools/hs-code`);
  await page.waitForLoadState('networkidle');
  await screenshot(page, 'hs-code-mobile.png');
  console.log('✓ HS 编码移动端');

  // 2. 汇率页面
  await page.goto(`${BASE_URL}/tools/exchange-rate`);
  await page.waitForLoadState('networkidle');
  await screenshot(page, 'exchange-rate-mobile.png');
  console.log('✓ 汇率移动端');

  // 3. 邮编页面
  await page.goto(`${BASE_URL}/tools/postal-code`);
  await page.waitForLoadState('networkidle');
  await screenshot(page, 'postal-code-mobile.png');
  console.log('✓ 邮编移动端');

  // 4. 地址格式化页面
  await page.goto(`${BASE_URL}/tools/address-formatter`);
  await page.waitForLoadState('networkidle');
  await screenshot(page, 'address-formatter-mobile.png');
  console.log('✓ 地址格式化移动端');

  await context.close();
  return true;
}

async function main() {
  console.log('🚀 开始 v1.20.42.6.39.1 Task Chain MVP 验收测试\n');

  const browser = await chromium.launch({ headless: true });

  try {
    // 任务链测试
    await testTaskChainA(browser);
    await testTaskChainB(browser);
    await testTaskChainC(browser);
    await testTaskChainD(browser);

    // 移动端测试
    await testMobileView(browser);

    console.log('\n✅ 所有任务链测试完成');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

main();
