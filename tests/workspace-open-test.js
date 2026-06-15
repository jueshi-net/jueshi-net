const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'quote_sheet open': null,
    'proforma-invoice open': null,
    'packing-list open': null,
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

    // 2. 打开 quote_sheet (下划线格式)
    await page.goto('https://jueshi.net/tools/documents/quotation?draftId=cmqdu05hq00051f5pz1r1c025', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const qsPageText = await page.textContent('body');
    if (qsPageText.includes('单据类型未找到') || qsPageText.includes('未找到单据类型')) {
      results['quote_sheet open'] = 'Error: 单据类型未找到';
    } else if (qsPageText.includes('报价单') || qsPageText.includes('Quote Sheet')) {
      results['quote_sheet open'] = 'Opened successfully';
    } else {
      results['quote_sheet open'] = 'Unknown state';
    }

    // 3. 打开 proforma-invoice (连字符格式)
    await page.goto('https://jueshi.net/tools/documents/proforma-invoice?draftId=cmqcaybsx000qccggdkity209', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const piPageText = await page.textContent('body');
    if (piPageText.includes('单据类型未找到') || piPageText.includes('未找到单据类型')) {
      results['proforma-invoice open'] = 'Error: 单据类型未找到';
    } else if (piPageText.includes('形式发票') || piPageText.includes('Proforma Invoice')) {
      results['proforma-invoice open'] = 'Opened successfully';
    } else {
      results['proforma-invoice open'] = 'Unknown state';
    }

    // 4. 打开 packing-list (连字符格式)
    await page.goto('https://jueshi.net/tools/documents/packing-list?draftId=cmqcaxugi000kccggk4e62wij', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const plPageText = await page.textContent('body');
    if (plPageText.includes('单据类型未找到') || plPageText.includes('未找到单据类型')) {
      results['packing-list open'] = 'Error: 单据类型未找到';
    } else if (plPageText.includes('装箱单') || plPageText.includes('Packing List')) {
      results['packing-list open'] = 'Opened successfully';
    } else {
      results['packing-list open'] = 'Unknown state';
    }

    // 检查是否有错误消息
    const errorElements = await page.$$('text=单据类型未找到, text=未找到单据类型');
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
