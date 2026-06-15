const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'Commercial Invoice page loaded': null,
    'Form filled': null,
    'Save clicked': null,
    'Save response': null,
    'Workspace documents': [],
    'error messages': [],
  };

  try {
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
      
      if (!results['E2E login']) {
        console.log('Login failed, current URL:', currentUrl);
        const pageText = await page.textContent('body');
        console.log('Page text:', pageText.substring(0, 500));
      }
    }

    // 2. 打开 Commercial Invoice
    await page.goto('https://jueshi.net/tools/commercial-invoice', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    results['Commercial Invoice page loaded'] = true;
    
    // 填写表单
    const invoiceNumberInput = await page.$('input[name="invoiceNumber"]');
    const sellerNameInput = await page.$('input[name="sellerName"]');
    const buyerNameInput = await page.$('input[name="buyerName"]');
    
    if (invoiceNumberInput) {
      await invoiceNumberInput.fill('TEST-CI-REUSE-002');
    }
    if (sellerNameInput) {
      await sellerNameInput.fill('Test Seller Company');
    }
    if (buyerNameInput) {
      await buyerNameInput.fill('Test Buyer Company');
    }
    
    results['Form filled'] = true;

    // 3. 点击保存按钮并监听网络请求
    const saveButton = await page.$('button:has-text("保存"), button:has-text("Save")');
    if (saveButton) {
      // 监听 API 响应
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/api/me/tool-documents'),
        { timeout: 10000 }
      ).catch(() => null);
      
      await saveButton.click();
      
      const response = await responsePromise;
      if (response) {
        results['Save response'] = {
          status: response.status(),
          url: response.url(),
        };
        
        try {
          const data = await response.json();
          results['Save response'].data = data;
        } catch (e) {
          // ignore
        }
      }
      
      await page.waitForTimeout(3000);
      results['Save clicked'] = true;
    }

    // 4. 进入 Workspace
    await page.goto('https://jueshi.net/workspace/documents', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 5. 获取所有文档链接
    const links = await page.$$eval('a', anchors => 
      anchors.map(a => ({ text: a.textContent?.trim(), href: a.href }))
        .filter(l => l.text && l.href.includes('draftId'))
    );
    
    results['Workspace documents'] = links;

  } catch (error) {
    console.error('Error:', error.message);
    results['error messages'].push(error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
