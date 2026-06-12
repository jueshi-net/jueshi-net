import { chromium } from 'playwright';

const documentId = 'cmq9kc45300037i5p5u2vsupl';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'scripts/storage-state.json' });
  const page = await context.newPage();

  try {
    // 打开恢复 URL
    await page.goto(`https://jueshi.net/tools/documents/commercial-invoice?draftId=${documentId}`, { timeout: 30000 });
    console.log('✓ Restore page loaded');

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 检查页面状态
    const url = page.url();
    console.log('Current URL:', url);

    // 截图
    await page.screenshot({ path: 'scripts/restore-verified.png' });
    console.log('✓ Screenshot saved');

    // 检查是否包含测试数据
    const pageContent = await page.content();
    
    const checks = [
      { name: 'CI E2E Company', found: pageContent.includes('CI E2E Company 20260611') },
      { name: 'CI E2E Client', found: pageContent.includes('CI E2E Client 20260611') },
      { name: 'CI-E2E-', found: pageContent.includes('CI-E2E-') },
      { name: 'phone case', found: pageContent.includes('phone case') },
      { name: 'KEEP-ME-CI-E2E', found: pageContent.includes('KEEP-ME-CI-E2E') }
    ];

    console.log('\n--- Restore Verification ---');
    checks.forEach(check => {
      console.log(`${check.found ? '✓' : '✗'} ${check.name}: ${check.found ? 'Found' : 'Not found'}`);
    });

    const allPassed = checks.every(c => c.found);
    console.log(`\n${allPassed ? '✓ All checks passed' : '✗ Some checks failed'}`);

  } catch (error) {
    console.error('Restore verification failed:', error);
    await page.screenshot({ path: 'scripts/restore-error.png' });
  } finally {
    await browser.close();
  }
})();
