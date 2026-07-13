const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // 移动端测试
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
  });
  
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = [];
  
  mobilePage.on('pageerror', error => mobileErrors.push(error.message));
  mobilePage.on('console', msg => {
    if (msg.type() === 'error') mobileErrors.push(msg.text());
  });
  
  await mobilePage.goto('https://i.jueshi.net/feedback', { waitUntil: 'networkidle' });
  
  const mobileResult = {
    viewport: '390x844',
    url: mobilePage.url(),
    h1: await mobilePage.$eval('h1', el => el.textContent.trim()).catch(() => null),
    scrollWidth: await mobilePage.evaluate(() => document.documentElement.scrollWidth),
    clientWidth: await mobilePage.evaluate(() => document.documentElement.clientWidth),
    overflow: await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    formExists: await mobilePage.$('form') !== null,
    submitButton: await mobilePage.$('button:has-text("提交反馈")') !== null,
    errors: mobileErrors
  };
  
  console.log('MOBILE_RESULT:', JSON.stringify(mobileResult, null, 2));
  
  await mobileContext.close();
  
  // 桌面端测试
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const desktopPage = await desktopContext.newPage();
  const desktopErrors = [];
  
  desktopPage.on('pageerror', error => desktopErrors.push(error.message));
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') desktopErrors.push(msg.text());
  });
  
  await desktopPage.goto('https://i.jueshi.net/feedback', { waitUntil: 'networkidle' });
  
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
  await browser.close();
})();
