const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  // 测试公共页面
  await page.goto('https://i.jueshi.net/tools');
  await page.waitForLoadState('networkidle');
  
  // 检查 MobileHeader 和 MobileBottomNav 是否存在
  const mobileHeader = await page.locator('header.lg\\:hidden').count();
  const mobileBottomNav = await page.locator('.lg\\:hidden.fixed.bottom-0').count();
  
  console.log('=== 公共页面移动端验证 (390x844) ===');
  console.log(`MobileHeader 数量: ${mobileHeader}`);
  console.log(`MobileBottomNav 数量: ${mobileBottomNav}`);
  
  // 检查是否有重复
  const allHeaders = await page.locator('header').count();
  console.log(`所有 header 元素数量: ${allHeaders}`);
  
  // 截图
  await page.screenshot({ path: 'mobile-tools-390x844.png', fullPage: true });
  console.log('截图已保存: mobile-tools-390x844.png');
  
  // 测试桌面端
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://i.jueshi.net/tools');
  await page.waitForLoadState('networkidle');
  
  const desktopMobileHeader = await page.locator('header.lg\\:hidden').count();
  const desktopMobileBottomNav = await page.locator('.lg\\:hidden.fixed.bottom-0').count();
  const desktopHeader = await page.locator('header.hidden.lg\\:block').count();
  
  console.log('\n=== 公共页面桌面端验证 (1440x900) ===');
  console.log(`MobileHeader 数量: ${desktopMobileHeader}`);
  console.log(`MobileBottomNav 数量: ${desktopMobileBottomNav}`);
  console.log(`Desktop Header 数量: ${desktopHeader}`);
  
  await page.screenshot({ path: 'desktop-tools-1440x900.png', fullPage: true });
  console.log('截图已保存: desktop-tools-1440x900.png');
  
  await browser.close();
  
  // 判断结果
  const mobilePass = mobileHeader === 1 && mobileBottomNav === 1 && allHeaders === 1;
  const desktopPass = desktopMobileHeader === 0 && desktopMobileBottomNav === 0 && desktopHeader === 1;
  
  console.log('\n=== 验证结果 ===');
  console.log(`移动端验证: ${mobilePass ? 'PASS' : 'FAIL'}`);
  console.log(`桌面端验证: ${desktopPass ? 'PASS' : 'FAIL'}`);
  console.log(`总体结果: ${mobilePass && desktopPass ? 'PASS' : 'FAIL'}`);
  
  process.exit(mobilePass && desktopPass ? 0 : 1);
})();
