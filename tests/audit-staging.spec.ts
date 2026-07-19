import { test, expect } from '@playwright/test';

test.describe('AUDIT - Staging Regression Test', () => {
  test.use({ storageState: 'tools/jueshi-audit/artifacts/storage-state/user-session.json' });

  test('AUDIT: All pages status check', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Home' },
      { url: '/tools', name: 'Tools' },
      { url: '/guides', name: 'Guides' },
      { url: '/bbs', name: 'Forum' },
      { url: '/workspace', name: 'Workspace' },
      { url: '/admin', name: 'Admin' },
    ];

    const results = [];

    for (const p of pages) {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', err => errors.push(err.message));

      try {
        const response = await page.goto(`https://i.jueshi.net${p.url}`, { waitUntil: 'networkidle', timeout: 30000 });
        const finalUrl = page.url();
        const title = await page.title();
        
        results.push({
          name: p.name,
          url: p.url,
          status: response?.status(),
          finalUrl,
          title,
          errors: errors.slice(0, 3),
        });
        
        console.log(`[${p.name}] Status: ${response?.status()}, Final URL: ${finalUrl}`);
        if (errors.length > 0) {
          console.log(`  Errors: ${errors.slice(0, 3).join(', ')}`);
        }
      } catch (err: any) {
        results.push({
          name: p.name,
          url: p.url,
          status: 'ERROR',
          error: err.message,
        });
        console.log(`[${p.name}] ERROR: ${err.message}`);
      }
    }

    // Output summary
    console.log('\n=== AUDIT SUMMARY ===');
    for (const r of results) {
      console.log(`${r.name}: ${r.status} - ${r.finalUrl || r.error}`);
    }
  });

  test('AUDIT: Workspace layout visual check', async ({ page }) => {
    await page.goto('https://i.jueshi.net/workspace', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check if redirected to login
    const currentUrl = page.url();
    console.log(`Workspace final URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('WARNING: Redirected to login page');
      return;
    }

    // Take screenshot
    await page.screenshot({ path: '/tmp/workspace-audit.png', fullPage: true });
    console.log('Screenshot saved to /tmp/workspace-audit.png');

    // Check layout structure
    const layout = await page.evaluate(() => {
      const body = document.body;
      const mainDiv = body.querySelector('div.flex.min-h-screen');
      
      if (!mainDiv) return { error: 'Main layout not found' };
      
      const children = Array.from(mainDiv.children).map(el => {
        const rect = el.getBoundingClientRect();
        const classes = el.className;
        const tag = el.tagName;
        
        // Check for sidebar
        if (el.tagName === 'ASIDE' || classes.includes('w-56') || classes.includes('w-60')) {
          return { type: 'sidebar', width: rect.width, classes };
        }
        
        // Check for flex container
        if (classes.includes('flex-1')) {
          const innerChildren = Array.from(el.children).map(inner => {
            const innerRect = inner.getBoundingClientRect();
            const innerClasses = inner.className;
            
            if (innerClasses.includes('w-[') || innerClasses.includes('w-[220px]') || innerClasses.includes('w-[240px]')) {
              return { type: 'rail', width: innerRect.width, classes: innerClasses };
            }
            if (inner.tagName === 'MAIN' || innerClasses.includes('flex-1')) {
              return { type: 'main', width: innerRect.width, classes: innerClasses };
            }
            return { type: 'other', width: innerRect.width, classes: innerClasses };
          });
          return { type: 'flex-container', width: rect.width, children: innerChildren };
        }
        
        return { type: 'other', width: rect.width, classes };
      });
      
      return { children };
    });

    console.log('\n=== WORKSPACE LAYOUT ===');
    console.log(JSON.stringify(layout, null, 2));

    // Check for duplicate user cards
    const userCards = await page.evaluate(() => {
      // Look for user identity elements
      const allText = document.body.innerText;
      const hasUserIdentityCard = allText.includes('成长进度') || allText.includes('Lv.');
      const sidebar = document.querySelector('aside.w-56') as HTMLElement;
      const hasUserNavCard = sidebar?.innerText?.includes('积分') || 
                              sidebar?.innerText?.includes('成长值');
      
      return {
        hasUserIdentityCard,
        hasUserNavCard,
        sidebarText: sidebar?.innerText?.substring(0, 200) || 'No sidebar found',
      };
    });

    console.log('\n=== USER CARD CHECK ===');
    console.log(JSON.stringify(userCards, null, 2));
  });

  test('AUDIT: Console errors check', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('https://i.jueshi.net/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    console.log('\n=== CONSOLE ERRORS (Home) ===');
    if (errors.length === 0) {
      console.log('No console errors');
    } else {
      errors.forEach(err => console.log(`ERROR: ${err}`));
    }
  });
});
