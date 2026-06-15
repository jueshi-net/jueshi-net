const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'proforma-invoice open': null,
    'packing-list open': null,
    'quote_sheet open': null,
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
    
    // 3. 查找 proforma-invoice (连字符格式)
    const piLink = await page.$('a:has-text("PI-2024-001"), a:has-text("形式发票"), a:has-text("Proforma Invoice")');
    if (piLink) {
      results['proforma-invoice open'] = 'Found in workspace';
      
      // 点击打开
      await piLink.click();
      await page.waitForTimeout(3000);
      
      // 检查是否有错误
      const errorText = await page.textContent('body');
      if (errorText.includes('单据类型未找到') || errorText.includes('未找到')) {
        results['proforma-invoice open'] = 'Error: 单据类型未找到';
      } else {
        results['proforma-invoice open'] = 'Opened successfully';
      }
    } else {
      results['proforma-invoice open'] = 'Not found in workspace';
    }

    // 4. 返回 Workspace
    await page.goto('https://jueshi.net/workspace/documents', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 5. 查找 packing-list (连字符格式)
    const plLink = await page.$('a:has-text("PL-2024-001"), a:has-text("装箱单"), a:has-text("Packing List")');
    if (plLink) {
      results['packing-list open'] = 'Found in workspace';
      
      // 点击打开
      await plLink.click();
      await page.waitForTimeout(3000);
      
      // 检查是否有错误
      const errorText = await page.textContent('body');
      if (errorText.includes('单据类型未找到') || errorText.includes('未找到')) {
        results['packing-list open'] = 'Error: 单据类型未找到';
      } else {
        results['packing-list open'] = 'Opened successfully';
      }
    } else {
      results['packing-list open'] = 'Not found in workspace';
    }

    // 6. 返回 Workspace
    await page.goto('https://jueshi.net/workspace/documents', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 7. 查找 quote_sheet (下划线格式)
    const qsLink = await page.$('a:has-text("报价单 2026-06-14"), a:has-text("Quote Sheet")');
    if (qsLink) {
      results['quote_sheet open'] = 'Found in workspace';
      
      // 点击打开
      await qsLink.click();
      await page.waitForTimeout(3000);
      
      // 检查是否有错误
      const errorText = await page.textContent('body');
      if (errorText.includes('单据类型未找到') || errorText.includes('未找到')) {
        results['quote_sheet open'] = 'Error: 单据类型未找到';
      } else {
        results['quote_sheet open'] = 'Opened successfully';
      }
    } else {
      results['quote_sheet open'] = 'Not found in workspace';
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
