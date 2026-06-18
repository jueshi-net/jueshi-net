// 工作台移动端视觉测试脚本
// 测试 360px, 375px, 390px, 414px 宽度下的显示效果

import { test, expect } from '@playwright/test';

test.describe('工作台移动端视觉测试', () => {
  const widths = [360, 375, 390, 414];
  
  test('工作台在不同移动端宽度下显示正常', async ({ page }) => {
    // 登录
    await page.goto('https://jueshi.net/login');
    await page.fill('input[type="email"]', '9833616@qq.com');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/workspace**', { timeout: 10000 });
    
    // 测试每个宽度
    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(1000); // 等待渲染
      
      // 检查无横向滚动
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      console.log(`宽度 ${width}px: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
      
      // 截图保存
      await page.screenshot({ 
        path: `tests/screenshots/workbench-${width}px.png`,
        fullPage: true 
      });
      
      // 验证无横向滚动（允许 1px 误差）
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
  
  test('工作台移动端元素检查', async ({ page }) => {
    await page.goto('https://jueshi.net/workspace');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(1000);
    
    // 检查关键元素是否存在
    const welcomeHeading = await page.locator('h1').textContent();
    console.log('欢迎标题:', welcomeHeading);
    
    // 检查统计卡片
    const statsCards = await page.locator('[class*="stats"]').count();
    console.log('统计卡片数量:', statsCards);
    
    // 检查侧边栏是否隐藏（移动端）
    const sidebar = await page.locator('[class*="sidebar"]').isVisible();
    console.log('侧边栏可见:', sidebar);
    
    // 截图
    await page.screenshot({ 
      path: 'tests/screenshots/workbench-375px-elements.png',
      fullPage: true 
    });
  });
});
