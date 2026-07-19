import { test } from '@playwright/test';

test('检查登录状态', async ({ browser }) => {
  const context = await browser.newContext({ 
    storageState: 'tools/jueshi-audit/artifacts/storage-state/user-session.json'
  });
  const page = await context.newPage();
  
  await page.goto('https://i.jueshi.net/bbs/my-posts');
  await page.waitForLoadState('networkidle');
  
  const loginButton = page.locator('text=登录 / 注册').first();
  const isLoggedIn = !(await loginButton.isVisible().catch(() => true));
  
  console.log(`登录状态: ${isLoggedIn ? '已登录' : '未登录'}`);
  
  await page.screenshot({ path: '/tmp/my-posts-status.png' });
  
  await context.close();
});
