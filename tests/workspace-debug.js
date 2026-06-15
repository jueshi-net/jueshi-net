const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

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
    }

    // 2. 进入 Workspace
    await page.goto('https://jueshi.net/workspace/documents', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 3. 获取页面内容
    const pageText = await page.textContent('body');
    const links = await page.$$eval('a', anchors => anchors.map(a => ({ text: a.textContent, href: a.href })));
    
    console.log('Page text (first 500 chars):', pageText.substring(0, 500));
    console.log('\nAll links:');
    links.forEach(link => {
      if (link.text && link.text.trim()) {
        console.log(`  ${link.text.trim().substring(0, 50)} -> ${link.href}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
