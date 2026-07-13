#!/usr/bin/env node
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  // 导航到 /tools 页面
  await page.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
  
  // 等待页面完全加载
  await page.waitForTimeout(2000);
  
  // 截取完整页面截图
  await page.screenshot({ 
    path: 'docs/evidence/tools-mobile-v2/mobile-390x844-full.png',
    fullPage: true 
  });
  
  // 截取首屏截图
  await page.screenshot({ 
    path: 'docs/evidence/tools-mobile-v2/mobile-390x844-viewport.png',
    fullPage: false 
  });
  
  console.log('Screenshots saved to docs/evidence/tools-mobile-v2/');
  
  await browser.close();
})();
