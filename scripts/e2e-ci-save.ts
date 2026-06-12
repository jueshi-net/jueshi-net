import { chromium } from 'playwright';

const timestamp = Date.now();
const testData = {
  invoiceNo: `CI-E2E-${timestamp}`,
  shipper: 'CI E2E Company 20260611',
  consignee: 'CI E2E Client 20260611',
  productName: 'phone case',
  quantity: '10',
  unitPrice: '10',
  remark: `KEEP-ME-CI-E2E-${timestamp}`
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'scripts/storage-state.json' });
  const page = await context.newPage();

  const networkRequests: any[] = [];
  const networkResponses: any[] = [];

  page.on('request', (req) => {
    if (req.url().includes('/api/user/documents')) {
      networkRequests.push({ url: req.url(), method: req.method(), body: req.postData() });
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/user/documents')) {
      let body = '';
      try {
        body = await res.text();
      } catch (e) {}
      networkResponses.push({ url: res.url(), status: res.status(), body: body.substring(0, 500) });
    }
  });

  try {
    // 打开 Commercial Invoice 页面
    await page.goto('https://jueshi.net/tools/documents/commercial-invoice', { timeout: 30000 });
    console.log('✓ Page loaded');

    // 关闭 Cookie 同意对话框
    const cookieButton = page.locator('button:has-text("我知道了")');
    if (await cookieButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookieButton.click();
    }

    // 填写表单
    await page.fill('input[placeholder*="PI-2024"]', testData.invoiceNo);
    await page.fill('input[placeholder*="发货人"]', testData.shipper);
    await page.fill('input[placeholder*="收货人"]', testData.consignee);
    
    // 填写 line item
    await page.fill('input[placeholder*="品名"]', testData.productName);
    await page.fill('input[placeholder*="数量"]', testData.quantity);
    await page.fill('input[placeholder*="单价"]', testData.unitPrice);
    await page.fill('input[placeholder*="备注"]', testData.remark);
    
    console.log('✓ Form filled');

    // 点击保存按钮
    const saveButton = page.locator('button:has-text("保存到工作台")');
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    
    const isEnabled = await saveButton.isEnabled();
    console.log('✓ Save button enabled:', isEnabled);

    if (!isEnabled) {
      console.log('✗ Save button is disabled - user may not be logged in');
      await page.screenshot({ path: 'scripts/ci-not-logged-in.png' });
      return;
    }

    await saveButton.click();
    console.log('✓ Save button clicked');

    // 等待 API 响应
    await page.waitForTimeout(3000);

    // 输出网络请求
    console.log('\n--- Network Requests ---');
    networkRequests.forEach((req, i) => {
      console.log(`Request ${i}:`, req.url, req.method);
      if (req.body) console.log('  Body:', req.body.substring(0, 300));
    });

    console.log('\n--- Network Responses ---');
    networkResponses.forEach((res, i) => {
      console.log(`Response ${i}:`, res.url, res.status);
      if (res.body) console.log('  Body:', res.body);
    });

    // 检查成功提示
    const successMessage = await page.locator('text=保存成功, text=Success, text=已保存').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log('✓ Success message visible:', successMessage);

    await page.screenshot({ path: 'scripts/ci-saved.png' });
    console.log('✓ Screenshot saved');

  } catch (error) {
    console.error('E2E failed:', error);
    await page.screenshot({ path: 'scripts/ci-error.png' });
  } finally {
    await browser.close();
  }
})();
