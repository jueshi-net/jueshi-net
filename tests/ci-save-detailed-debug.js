const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'isAuthenticated after login': null,
    'Save button clicked': null,
    'API requests': [],
    'API responses': [],
    'Console logs': [],
    'Alert messages': [],
    'error messages': [],
  };

  try {
    // 监听 console
    page.on('console', msg => {
      results['Console logs'].push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    // 监听 dialog (alert)
    page.on('dialog', async dialog => {
      results['Alert messages'].push(dialog.message());
      await dialog.accept();
    });

    // 监听网络请求
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        results['API requests'].push({
          method: request.method(),
          url: request.url(),
        });
      }
    });

    // 监听网络响应
    page.on('response', async response => {
      if (response.url().includes('/api/me/tool-documents')) {
        const body = await response.text().catch(() => 'N/A');
        results['API responses'].push({
          status: response.status(),
          url: response.url(),
          body: body.substring(0, 200),
        });
      }
    });

    // 1. 登录 E2E 账号
    await page.goto('https://jueshi.net/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.fill('e2e-doc-user@jueshi.net');
      await passwordInput.fill('Test123456!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      results['E2E login'] = !currentUrl.includes('/login');
    }

    // 2. 检查 isAuthenticated
    const isAuthenticated = await page.evaluate(() => {
      return (
        document.cookie.includes("next-auth.session-token") ||
        document.cookie.includes("__Secure-next-auth.session-token") ||
        document.cookie.includes("authjs.session-token") ||
        document.cookie.includes("__Secure-authjs.session-token")
      );
    });
    results['isAuthenticated after login'] = isAuthenticated;

    // 3. 打开 Commercial Invoice
    await page.goto('https://jueshi.net/tools/commercial-invoice', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 填写表单
    const invoiceNumberInput = await page.$('input[name="invoiceNumber"]');
    if (invoiceNumberInput) {
      await invoiceNumberInput.fill('TEST-CI-004');
    }

    // 4. 点击保存按钮
    const saveButton = await page.$('button:has-text("保存"), button:has-text("Save")');
    if (saveButton) {
      await saveButton.click();
      results['Save button clicked'] = true;
      await page.waitForTimeout(5000);
    }

  } catch (error) {
    console.error('Error:', error.message);
    results['error messages'].push(error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
