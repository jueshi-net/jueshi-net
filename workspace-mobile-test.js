const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: '375x812', width: 375, height: 812 },
    { name: '390x844', width: 390, height: 844 },
    { name: '430x932', width: 430, height: 932 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '1440x900', width: 1440, height: 900 }
  ];

  const results = {};
  const metrics = {};

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    
    const page = await context.newPage();
    
    try {
      // 访问登录页面
      await page.goto('https://i.jueshi.net/login', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 使用测试账号登录
      await page.fill('input[type="email"]', '9833416@qq.com');
      await page.fill('input[type="password"]', 'Test123456');
      await page.click('button[type="submit"]');
      
      // 等待登录完成
      await page.waitForURL('**/workspace', { timeout: 10000 });
      
      // 等待页面完全加载
      await page.waitForTimeout(2000);
      
      // 检查横向溢出
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasOverflow = scrollWidth > clientWidth + 2;
      
      // 获取关键元素位置
      const elements = await page.evaluate(() => {
        const getRect = (selector) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom)
          };
        };
        
        return {
          root: getRect('[class*="grid"]'),
          mainContent: getRect('[class*="min-w-0"]'),
          rightRail: getRect('aside'),
          welcomeSection: getRect('section[class*="bg-gradient"]')
        };
      });
      
      // 截图
      await page.screenshot({ 
        path: `./workspace-${vp.name}.png`,
        fullPage: true 
      });
      
      results[vp.name] = {
        scrollWidth,
        clientWidth,
        hasOverflow,
        elements,
        status: hasOverflow ? 'FAIL' : 'PASS'
      };
      
      metrics[vp.name] = {
        viewportWidth: vp.width,
        documentScrollWidth: scrollWidth,
        rootRect: elements.root,
        mainRect: elements.mainContent,
        rightRailRect: elements.rightRail
      };
      
      console.log(`${vp.name}: ${hasOverflow ? 'FAIL (overflow)' : 'PASS'}`);
      if (hasOverflow) {
        console.log(`  scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
      }
      
    } catch (error) {
      results[vp.name] = { status: 'ERROR', error: error.message };
      console.log(`${vp.name}: ERROR - ${error.message}`);
    }
    
    await context.close();
  }
  
  // 保存指标
  const fs = require('fs');
  fs.writeFileSync('./workspace-mobile-layout-metrics.json', JSON.stringify(metrics, null, 2));
  
  console.log('\n=== SUMMARY ===');
  const passCount = Object.values(results).filter(r => r.status === 'PASS').length;
  const totalCount = Object.keys(results).length;
  console.log(`Passed: ${passCount}/${totalCount}`);
  
  await browser.close();
  
  // 返回退出码
  const allPass = passCount === totalCount;
  process.exit(allPass ? 0 : 1);
})();
