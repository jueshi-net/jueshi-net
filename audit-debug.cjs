const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  
  // 1. Desktop overflow analysis
  await page.goto('https://i.jueshi.net/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const offenders = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollWidth > docWidth + 2 && el.children.length < 5) {
        const rect = el.getBoundingClientRect();
        offenders.push({
          tag: el.tagName,
          cls: (el.className || '').toString().substring(0, 100),
          id: el.id || '',
          width: Math.round(rect.width),
          scrollW: el.scrollWidth,
          left: Math.round(rect.left)
        });
      }
    });
    return { docWidth, scrollWidth, diff: scrollWidth - docWidth, offenders: offenders.slice(0, 10) };
  });
  console.log('=== OVERFLOW ===');
  console.log(JSON.stringify(overflow, null, 2));
  
  // 2. Login test with proper React handling
  await page.goto('https://i.jueshi.net/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);
  
  // Use type instead of fill for React forms
  await page.click('input[type="email"]');
  await page.type('input[type="email"]', 'audit-admin@jueshi.net', { delay: 30 });
  await page.click('input[type="password"]');
  await page.type('input[type="password"]', process.env.AUDIT_TEST_PASSWORD || '', { delay: 30 });
  await page.waitForTimeout(500);
  
  // Click submit and wait for navigation
  await Promise.all([
    page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await page.waitForTimeout(2000);
  console.log('\n=== LOGIN RESULT ===');
  console.log('URL:', page.url());
  console.log('Logged in:', !page.url().includes('/login'));
  
  await page.screenshot({ path: '/tmp/audit-login-test.png' });
  
  await browser.close();
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
