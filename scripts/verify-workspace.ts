import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'scripts/storage-state.json' });
  const page = await context.newPage();

  try {
    await page.goto('https://jueshi.net/workspace', { timeout: 30000 });
    console.log('Workspace URL:', page.url());
    
    // 检查是否在 /workspace
    if (page.url().includes('/workspace')) {
      console.log('✓ Workspace login verified - not redirected to /login');
    } else {
      console.log('✗ Workspace login failed - redirected to:', page.url());
    }
    
    await page.screenshot({ path: 'scripts/workspace-verified.png' });
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
  }
})();
