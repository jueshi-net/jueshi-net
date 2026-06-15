const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'Workspace documents': [],
    'Commercial Invoice found': null,
    'Commercial Invoice opened': null,
    'Form restored': null,
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
    }

    // 2. 进入 Workspace
    await page.goto('https://jueshi.net/workspace/documents', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 3. 获取所有文档链接
    const links = await page.$$eval('a', anchors => 
      anchors.map(a => ({ text: a.textContent?.trim(), href: a.href }))
        .filter(l => l.text && l.href.includes('draftId'))
    );
    
    results['Workspace documents'] = links;

    // 4. 查找 Commercial Invoice
    const ciLink = links.find(l => 
      l.href.includes('commercial-invoice') || 
      (l.text && l.text.includes('商业发票'))
    );
    
    if (ciLink) {
      results['Commercial Invoice found'] = ciLink;
      
      // 5. 打开 Commercial Invoice
      await page.goto(ciLink.href, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      
      results['Commercial Invoice opened'] = true;
      
      // 6. 检查表单是否恢复
      const invoiceNoInput = await page.$('input[name="invoiceNo"]');
      if (invoiceNoInput) {
        const value = await invoiceNoInput.getAttribute('value');
        results['Form restored'] = value ? true : false;
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    results['error messages'].push(error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
