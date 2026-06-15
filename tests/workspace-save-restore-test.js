const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'Commercial Invoice save': null,
    'Commercial Invoice open': null,
    'Commercial Invoice restore': null,
    'Quote Sheet save': null,
    'Quote Sheet open': null,
    'Quote Sheet restore': null,
    'error messages': [],
  };

  try {
    // 1. 登录 E2E 账号
    await page.goto('https://jueshi.net/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // 检查是否有登录表单
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.fill('e2e-doc-user@jueshi.net');
      await passwordInput.fill('Test123456!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // 检查是否登录成功
      const currentUrl = page.url();
      results['E2E login'] = !currentUrl.includes('/login');
    } else {
      results['E2E login'] = 'Login form not found';
    }

    // 2. 测试 Commercial Invoice
    await page.goto('https://jueshi.net/tools/commercial-invoice', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 填写表单
    const invoiceNumberInput = await page.$('input[name="invoiceNumber"], input[placeholder*="发票号"]');
    if (invoiceNumberInput) {
      await invoiceNumberInput.fill('TEST-CI-001');
      results['Commercial Invoice save'] = 'Form filled';
    }

    // 点击保存按钮
    const saveButton = await page.$('button:has-text("保存"), button:has-text("Save")');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      results['Commercial Invoice save'] = 'Save clicked';
    }

    // 3. 进入 Workspace
    await page.goto('https://jueshi.net/workspace/documents', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 查找刚保存的 Commercial Invoice
    const ciLink = await page.$('a:has-text("TEST-CI-001"), a:has-text("商业发票"), a:has-text("Commercial Invoice")');
    if (ciLink) {
      results['Commercial Invoice open'] = 'Found in workspace';
      
      // 点击打开
      await ciLink.click();
      await page.waitForTimeout(3000);
      
      // 检查是否恢复到表单
      const restoredInput = await page.$('input[value="TEST-CI-001"]');
      results['Commercial Invoice restore'] = restoredInput ? true : false;
    } else {
      results['Commercial Invoice open'] = 'Not found in workspace';
    }

    // 4. 测试 Quote Sheet
    await page.goto('https://jueshi.net/tools/documents/quotation', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 填写表单
    const quoteNumberInput = await page.$('input[name="quoteNumber"], input[placeholder*="报价单号"]');
    if (quoteNumberInput) {
      await quoteNumberInput.fill('TEST-QS-001');
      results['Quote Sheet save'] = 'Form filled';
    }

    // 点击保存按钮
    const qsSaveButton = await page.$('button:has-text("保存"), button:has-text("Save")');
    if (qsSaveButton) {
      await qsSaveButton.click();
      await page.waitForTimeout(3000);
      results['Quote Sheet save'] = 'Save clicked';
    }

    // 5. 进入 Workspace
    await page.goto('https://jueshi.net/workspace/documents', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 查找刚保存的 Quote Sheet
    const qsLink = await page.$('a:has-text("TEST-QS-001"), a:has-text("报价单"), a:has-text("Quote Sheet")');
    if (qsLink) {
      results['Quote Sheet open'] = 'Found in workspace';
      
      // 点击打开
      await qsLink.click();
      await page.waitForTimeout(3000);
      
      // 检查是否恢复到表单
      const restoredQsInput = await page.$('input[value="TEST-QS-001"]');
      results['Quote Sheet restore'] = restoredQsInput ? true : false;
    } else {
      results['Quote Sheet open'] = 'Not found in workspace';
    }

    // 检查是否有错误消息
    const errorElements = await page.$$('text=单据类型未找到, text=未找到, text=错误');
    for (const elem of errorElements) {
      const text = await elem.textContent();
      results['error messages'].push(text);
    }

  } catch (error) {
    console.error('Error:', error.message);
    results['error messages'].push(error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
