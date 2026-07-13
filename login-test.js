const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    // 访问登录页面
    await page.goto('https://i.jueshi.net/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('Login page loaded');
    
    // 关闭 Cookie 同意对话框
    const cookieButton = page.locator('button:has-text("我知道了")');
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      console.log('Cookie dialog closed');
      await page.waitForTimeout(500);
    }
    
    // 使用正确的选择器填写登录表单
    await page.fill('input[placeholder="your@email.com"]', '9833416@qq.com');
    await page.fill('input[placeholder="至少6位密码"]', 'Test123456');
    
    console.log('Credentials filled');
    
    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    console.log('Submit clicked');
    
    // 等待导航完成
    await page.waitForTimeout(3000);
    
    // 检查是否成功登录
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/workspace')) {
      console.log('✓ Login successful');
      
      // 保存登录状态
      await context.storageState({ path: './.auth/test-user-state.json' });
      console.log('Auth state saved');
      
    } else {
      console.log('✗ Login failed');
      await page.screenshot({ path: './login-failed.png' });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: './login-error.png' });
  }
  
  await browser.close();
})();
