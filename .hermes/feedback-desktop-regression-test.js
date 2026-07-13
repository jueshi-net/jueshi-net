const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // 桌面端 1440x900
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const desktopPage = await desktopContext.newPage();
  const desktopErrors = [];
  
  desktopPage.on('pageerror', error => desktopErrors.push(error.message));
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') desktopErrors.push(msg.text());
  });
  
  await desktopPage.goto('https://i.jueshi.net/feedback', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await desktopPage.waitForTimeout(2000);
  
  const desktopResult = {
    viewport: '1440x900',
    url: desktopPage.url(),
    h1: await desktopPage.$eval('h1', el => el.textContent.trim()).catch(() => null),
    scrollWidth: await desktopPage.evaluate(() => document.documentElement.scrollWidth),
    clientWidth: await desktopPage.evaluate(() => document.documentElement.clientWidth),
    overflow: await desktopPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    formExists: await desktopPage.$('form') !== null,
    submitButton: await desktopPage.$('button:has-text("提交反馈")') !== null,
    errors: desktopErrors
  };
  
  console.log('DESKTOP_RESULT:', JSON.stringify(desktopResult, null, 2));
  
  await desktopContext.close();
  
  // 回归测试
  const regressionContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const regressionPage = await regressionContext.newPage();
  const regressionErrors = [];
  
  regressionPage.on('pageerror', error => regressionErrors.push({ url: regressionPage.url(), error: error.message }));
  regressionPage.on('console', msg => {
    if (msg.type() === 'error') regressionErrors.push({ url: regressionPage.url(), error: msg.text() });
  });
  
  const pages = ['/', '/tools', '/resources', '/guides', '/checklists', '/topics', '/search'];
  const regressionResults = {};
  
  for (const path of pages) {
    try {
      await regressionPage.goto(`https://i.jueshi.net${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await regressionPage.waitForTimeout(1000);
      
      const h1 = await regressionPage.$eval('h1', el => el.textContent.trim()).catch(() => null);
      const hasAppError = await regressionPage.evaluate(() => 
        document.body.textContent.includes('Application error')
      );
      
      regressionResults[path] = {
        status: 'ok',
        h1,
        hasAppError,
        errors: regressionErrors.filter(e => e.url.includes(path))
      };
    } catch (err) {
      regressionResults[path] = {
        status: 'error',
        error: err.message
      };
    }
  }
  
  console.log('REGRESSION_RESULTS:', JSON.stringify(regressionResults, null, 2));
  
  // 验证 /tools 搜索和常用工具
  await regressionPage.goto('https://i.jueshi.net/tools', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await regressionPage.waitForTimeout(1500);
  
  const searchInput = await regressionPage.$('input[placeholder*="搜索"]');
  const tools = await regressionPage.$$eval('a[href*="/tools/"]', links => 
    links.slice(0, 6).map(link => ({
      href: link.getAttribute('href'),
      text: link.textContent.trim()
    }))
  );
  
  console.log('TOOLS_SEARCH_INPUT:', searchInput !== null);
  console.log('TOOLS_COMMON:', JSON.stringify(tools, null, 2));
  
  await regressionContext.close();
  await browser.close();
})();
