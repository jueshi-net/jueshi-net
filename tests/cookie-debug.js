const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'Cookies after login': [],
    'isAuthenticated result': null,
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

    // 2. 检查 cookies
    const cookies = await context.cookies();
    results['Cookies after login'] = cookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
    }));

    // 3. 检查 isAuthenticated
    const isAuthenticated = await page.evaluate(() => {
      return (
        document.cookie.includes("next-auth.session-token") ||
        document.cookie.includes("__Secure-next-auth.session-token")
      );
    });
    results['isAuthenticated result'] = isAuthenticated;

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
