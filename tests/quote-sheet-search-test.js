const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    '/tools search quote': null,
    '/tools search quotation': null,
    '/tools search 报价': null,
    '/tools search 报价单': null,
  };

  try {
    // 4. /tools 主工具页搜索 quote
    await page.goto('https://jueshi.net/tools?q=quote', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const toolsPageText = await page.textContent('body');
    results['/tools search quote'] = 
      toolsPageText.includes('报价单') || 
      toolsPageText.includes('Quote Sheet') || 
      toolsPageText.includes('Quotation');

    // 5. /tools 主工具页搜索 quotation
    await page.goto('https://jueshi.net/tools?q=quotation', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const toolsPageText2 = await page.textContent('body');
    results['/tools search quotation'] = 
      toolsPageText2.includes('报价单') || 
      toolsPageText2.includes('Quote Sheet') || 
      toolsPageText2.includes('Quotation');

    // 6. /tools 主工具页搜索 报价
    await page.goto('https://jueshi.net/tools?q=报价', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const toolsPageText3 = await page.textContent('body');
    results['/tools search 报价'] = 
      toolsPageText3.includes('报价单') || 
      toolsPageText3.includes('Quote Sheet') || 
      toolsPageText3.includes('Quotation');

    // 7. /tools 主工具页搜索 报价单
    await page.goto('https://jueshi.net/tools?q=报价单', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const toolsPageText4 = await page.textContent('body');
    results['/tools search 报价单'] = 
      toolsPageText4.includes('报价单') || 
      toolsPageText4.includes('Quote Sheet') || 
      toolsPageText4.includes('Quotation');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
