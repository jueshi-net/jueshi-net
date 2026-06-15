const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'Commercial Invoice page loaded': null,
    'Form fields': {},
    'Save button state': null,
    'Console errors': [],
    'error messages': [],
  };

  try {
    // 监听 console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results['Console errors'].push(msg.text());
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

    // 2. 打开 Commercial Invoice
    await page.goto('https://jueshi.net/tools/commercial-invoice', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    results['Commercial Invoice page loaded'] = true;
    
    // 检查表单字段
    const fields = await page.$$eval('input, textarea', elements => 
      elements.map(el => ({
        name: el.name || el.id,
        type: el.type,
        value: el.value,
        required: el.required,
      }))
    );
    results['Form fields'] = fields;

    // 3. 填写必填字段
    const invoiceNumberInput = await page.$('input[name="invoiceNumber"]');
    if (invoiceNumberInput) {
      await invoiceNumberInput.fill('TEST-CI-003');
    }

    // 4. 检查保存按钮状态
    const saveButton = await page.$('button:has-text("保存"), button:has-text("Save")');
    if (saveButton) {
      const isDisabled = await saveButton.isDisabled();
      const buttonText = await saveButton.textContent();
      results['Save button state'] = {
        disabled: isDisabled,
        text: buttonText,
      };
      
      // 尝试点击
      if (!isDisabled) {
        await saveButton.click();
        await page.waitForTimeout(5000);
        
        // 检查是否有 alert
        const alertText = await page.evaluate(() => {
          return window.alert ? 'alert function exists' : 'no alert';
        });
        console.log('Alert check:', alertText);
      }
    }

    // 5. 检查网络请求
    const requests = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .filter(r => r.name.includes('/api/'))
        .map(r => ({ name: r.name, duration: r.duration }));
    });
    console.log('API requests:', requests);

  } catch (error) {
    console.error('Error:', error.message);
    results['error messages'].push(error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
