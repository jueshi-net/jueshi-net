const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    'E2E login': null,
    'All cookies': [],
    'Session cookies': [],
    'document.cookie': null,
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

    // 2. 获取所有 cookies（包括 httpOnly）
    const cookies = await context.cookies();
    results['All cookies'] = cookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
    }));

    // 3. 过滤 session cookies
    results['Session cookies'] = cookies.filter(c => 
      c.name.includes('session') || c.name.includes('auth')
    ).map(c => ({
      name: c.name,
      httpOnly: c.httpOnly,
    }));

    // 4. 检查 document.cookie
    const documentCookie = await page.evaluate(() => document.cookie);
    results['document.cookie'] = documentCookie;

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
})();
