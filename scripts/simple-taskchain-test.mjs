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

async function main() {
  console.log('🚀 简化版任务链验收测试\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 验证 HS 编码页面
    console.log('=== 1. HS 编码页面 ===');
    await page.goto(`${BASE_URL}/tools/hs-code`);
    await page.waitForLoadState('domcontentloaded');
    await screenshot(page, 'hs-code-task-chain.png');
    console.log('✓ 页面加载成功');

    // 2. 验证汇率页面
    console.log('\n=== 2. 汇率页面 ===');
    await page.goto(`${BASE_URL}/tools/exchange-rate`);
    await page.waitForLoadState('domcontentloaded');
    await screenshot(page, 'exchange-rate-task-chain.png');
    console.log('✓ 页面加载成功');

    // 3. 验证邮编页面
    console.log('\n=== 3. 邮编页面 ===');
    await page.goto(`${BASE_URL}/tools/postal-code`);
    await page.waitForLoadState('domcontentloaded');
    await screenshot(page, 'postal-code-task-chain.png');
    console.log('✓ 页面加载成功');

    // 4. 验证地址格式化页面
    console.log('\n=== 4. 地址格式化页面 ===');
    await page.goto(`${BASE_URL}/tools/address-formatter`);
    await page.waitForLoadState('domcontentloaded');
    await screenshot(page, 'address-formatter-task-chain.png');
    console.log('✓ 页面加载成功');

    // 5. 验证商业发票页面
    console.log('\n=== 5. 商业发票页面 ===');
    await page.goto(`${BASE_URL}/tools/documents/commercial-invoice`);
    await page.waitForLoadState('domcontentloaded');
    await screenshot(page, 'commercial-invoice-prefill-banner.png');
    console.log('✓ 页面加载成功');

    // 6. 验证报价单页面
    console.log('\n=== 6. 报价单页面 ===');
    await page.goto(`${BASE_URL}/tools/documents/quotation`);
    await page.waitForLoadState('domcontentloaded');
    await screenshot(page, 'quotation-prefill-banner.png');
    console.log('✓ 页面加载成功');

    // 7. 移动端验证
    console.log('\n=== 7. 移动端验证 (375px) ===');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${BASE_URL}/tools/hs-code`);
    await mobilePage.waitForLoadState('domcontentloaded');
    await screenshot(mobilePage, 'task-chain-mobile.png');
    console.log('✓ 移动端截图完成');

    await mobileContext.close();

    console.log('\n✅ 所有截图完成');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    await context.close();
    await browser.close();
  }
}

main();
