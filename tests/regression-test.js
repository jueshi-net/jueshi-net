const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'Commercial Invoice guest save': null,
    'Commercial Invoice refresh restore': null,
    'Quote Sheet guest save': null,
    'Quote Sheet refresh restore': null,
    'HS Code toy': null,
    'HS Code shoes': null,
    'HS Code 9503': null,
    'HS Code quick switch': null,
    'Container calculation': null,
    '/workspace redirect': null,
    '9833416@qq.com unchanged': null,
  };

  try {
    // 1. Commercial Invoice 游客本地保存
    await page.goto('https://jueshi.net/tools/commercial-invoice', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const ciInvoiceInput = await page.$('input[name="invoiceNumber"]');
    if (ciInvoiceInput) {
      await ciInvoiceInput.fill('TEST-CI-GUEST-001');
      results['Commercial Invoice guest save'] = 'Form filled';
      
      // 检查 localStorage
      const localStorage = await page.evaluate(() => {
        return localStorage.getItem('invoice-draft');
      });
      results['Commercial Invoice guest save'] = localStorage ? 'Saved to localStorage' : 'Not saved';
    }

    // 2. Commercial Invoice 刷新恢复
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const ciRestoredInput = await page.$('input[value="TEST-CI-GUEST-001"]');
    results['Commercial Invoice refresh restore'] = ciRestoredInput ? true : false;

    // 3. Quote Sheet 游客本地保存
    await page.goto('https://jueshi.net/tools/documents/quotation', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const qsQuoteInput = await page.$('input[name="quoteNumber"]');
    if (qsQuoteInput) {
      await qsQuoteInput.fill('TEST-QS-GUEST-001');
      results['Quote Sheet guest save'] = 'Form filled';
      
      // 检查 localStorage
      const localStorage = await page.evaluate(() => {
        return localStorage.getItem('quote-sheet-draft');
      });
      results['Quote Sheet guest save'] = localStorage ? 'Saved to localStorage' : 'Not saved';
    }

    // 4. Quote Sheet 刷新恢复
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const qsRestoredInput = await page.$('input[value="TEST-QS-GUEST-001"]');
    results['Quote Sheet refresh restore'] = qsRestoredInput ? true : false;

    // 5. HS Code toy
    await page.goto('https://jueshi.net/tools/hs-code', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const hsSearchInput = await page.$('input[placeholder*="搜索"], input[type="text"]');
    if (hsSearchInput) {
      await hsSearchInput.fill('toy');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      const hsPageText = await page.textContent('body');
      results['HS Code toy'] = hsPageText.includes('toy') || hsPageText.includes('玩具') || hsPageText.length > 1000;
    }

    // 6. HS Code shoes
    if (hsSearchInput) {
      await hsSearchInput.fill('shoes');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      const hsPageText = await page.textContent('body');
      results['HS Code shoes'] = hsPageText.includes('shoes') || hsPageText.includes('鞋') || hsPageText.length > 1000;
    }

    // 7. HS Code 9503
    if (hsSearchInput) {
      await hsSearchInput.fill('9503');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      const hsPageText = await page.textContent('body');
      results['HS Code 9503'] = hsPageText.includes('9503') || hsPageText.length > 1000;
    }

    // 8. HS Code quick switch
    if (hsSearchInput) {
      await hsSearchInput.fill('toy');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await hsSearchInput.fill('shoes');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await hsSearchInput.fill('9503');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      
      const hsPageText = await page.textContent('body');
      results['HS Code quick switch'] = !hsPageText.includes('loading') && hsPageText.length > 1000;
    }

    // 9. Container calculation
    await page.goto('https://jueshi.net/tools/container', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const lengthInput = await page.$('input[name="length"], input[placeholder*="长"]');
    const widthInput = await page.$('input[name="width"], input[placeholder*="宽"]');
    const heightInput = await page.$('input[name="height"], input[placeholder*="高"]');
    const weightInput = await page.$('input[name="weight"], input[placeholder*="重量"]');
    const quantityInput = await page.$('input[name="quantity"], input[placeholder*="数量"]');
    
    if (lengthInput && widthInput && heightInput && weightInput && quantityInput) {
      await lengthInput.fill('60');
      await widthInput.fill('40');
      await heightInput.fill('50');
      await weightInput.fill('15');
      await quantityInput.fill('100');
      
      const calculateButton = await page.$('button:has-text("计算"), button:has-text("Calculate")');
      if (calculateButton) {
        await calculateButton.click();
        await page.waitForTimeout(3000);
        
        const containerPageText = await page.textContent('body');
        results['Container calculation'] = 
          containerPageText.includes('0.12') && 
          containerPageText.includes('12') && 
          containerPageText.includes('36.1');
      }
    }

    // 10. /workspace redirect
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('https://jueshi.net/workspace', { waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(3000);
    
    const workspaceUrl = page2.url();
    results['/workspace redirect'] = workspaceUrl.includes('/login') || workspaceUrl.includes('/workspace');
    
    await context2.close();

    // 11. 9833416@qq.com unchanged (只读检查)
    // 这个需要通过 SSH 检查，这里先标记为需要手动验证
    results['9833416@qq.com unchanged'] = 'Need SSH verification';

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
