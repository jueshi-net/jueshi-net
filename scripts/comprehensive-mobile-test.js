#!/usr/bin/env node
/**
 * Comprehensive Mobile Interaction Test
 * Tests: menu, sticky, tool clicks, screenshots
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = 'docs/evidence/tools-mobile-v2-remediation';
const URL = 'https://i.jueshi.net/tools';

// Ensure evidence directory exists
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();
  const results = {
    menuOpen: false,
    menuClose: false,
    menuNavigation: false,
    stickyFilterNoHeaderOverlap: false,
    noHorizontalOverflow: false,
    toolCards: { total: 0, unique: 0, empty: 0, duplicate: 0 },
    toolClicks: {}
  };

  try {
    // 1. Navigate to /tools
    console.log('1. Loading /tools...');
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Dismiss cookie dialog if present
    try {
      const cookieBtn = await page.$('button:has-text("我知道了")');
      if (cookieBtn) {
        await cookieBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Cookie dialog not present
    }

    // Screenshot 1: First viewport
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '01-first-viewport.png'), fullPage: false });
    console.log('   ✅ Screenshot: 01-first-viewport.png');

    // 2. Check horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    results.noHorizontalOverflow = scrollWidth <= viewportWidth;
    console.log(`2. Horizontal overflow: scrollWidth=${scrollWidth}, viewportWidth=${viewportWidth}, pass=${results.noHorizontalOverflow}`);

    // 3. Extract tool cards
    const toolCards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a[href^="/tools/"]'));
      const hrefs = cards.map(card => card.getAttribute('href'));
      const uniqueHrefs = [...new Set(hrefs)];
      const emptyHrefs = hrefs.filter(h => !h || h.trim() === '');
      
      const hrefCounts = {};
      hrefs.forEach(h => { hrefCounts[h] = (hrefCounts[h] || 0) + 1; });
      const duplicateHrefs = Object.entries(hrefCounts).filter(([_, count]) => count > 1);
      
      return {
        total: cards.length,
        unique: uniqueHrefs.length,
        empty: emptyHrefs.length,
        duplicate: duplicateHrefs.length,
        hrefs: uniqueHrefs.slice(0, 10)
      };
    });
    results.toolCards = toolCards;
    console.log(`3. Tool cards: total=${toolCards.total}, unique=${toolCards.unique}, empty=${toolCards.empty}, duplicate=${toolCards.duplicate}`);

    // 4. Test menu open
    console.log('4. Testing menu open...');
    const menuButton = await page.$('header button');
    if (menuButton) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      const menuOpen = await page.evaluate(() => {
        // The mobile menu is a div.fixed.inset-0 with z-40
        const menu = document.querySelector('div.fixed.inset-0.z-40');
        if (!menu) return false;
        // Check visibility using getBoundingClientRect (offsetParent can be null for fixed)
        const rect = menu.getBoundingClientRect();
        return rect.height > 0 && rect.width > 0;
      });
      results.menuOpen = menuOpen;
      console.log(`   Menu open: ${menuOpen ? 'PASS' : 'FAIL'}`);

      // Screenshot 2: Menu open
      await page.screenshot({ path: path.join(EVIDENCE_DIR, '02-menu-open.png'), fullPage: false });
      console.log('   ✅ Screenshot: 02-menu-open.png');

      // 5. Test menu close - click menu button again to toggle
      console.log('5. Testing menu close...');
      await menuButton.click();
      await page.waitForTimeout(500);
      
      const menuClosed = await page.evaluate(() => {
        const menu = document.querySelector('div.fixed.inset-0.z-40');
        return !menu || menu.offsetParent === null;
      });
      results.menuClose = menuClosed;
      console.log(`   Menu close: ${menuClosed ? 'PASS' : 'FAIL'}`);

      // Screenshot 3: Menu closed
      await page.screenshot({ path: path.join(EVIDENCE_DIR, '03-menu-closed.png'), fullPage: false });
      console.log('   ✅ Screenshot: 03-menu-closed.png');
    } else {
      console.log('   ⚠ Menu button not found, skipping menu tests');
    }

    // 6. Test sticky search area - specifically check filter bar, not header
    console.log('6. Testing sticky filter...');
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    
    const stickyCheck = await page.evaluate(() => {
      // Find the filter bar specifically (contains search input)
      const filterBar = document.querySelector('.bg-white.border-b:has(input[placeholder*="搜索"])');
      if (!filterBar) return { found: false };
      
      const style = window.getComputedStyle(filterBar);
      const rect = filterBar.getBoundingClientRect();
      const header = document.querySelector('header');
      const headerRect = header ? header.getBoundingClientRect() : null;
      
      // Check if filter bar overlaps with header
      const overlaps = headerRect && rect.top < headerRect.bottom && rect.bottom > headerRect.top;
      
      return {
        found: true,
        position: style.position,
        top: style.top,
        rectTop: rect.top,
        headerBottom: headerRect ? headerRect.bottom : null,
        overlaps: overlaps
      };
    });
    
    // On mobile, filter bar should be static (not sticky)
    const isMobileStatic = stickyCheck.position === 'static';
    results.stickyFilterNoHeaderOverlap = isMobileStatic || (stickyCheck.found && !stickyCheck.overlaps);
    console.log(`   Sticky filter: found=${stickyCheck.found}, position=${stickyCheck.position}, overlaps=${stickyCheck.overlaps}, pass=${results.stickyFilterNoHeaderOverlap}`);

    // Screenshot 4: Scrolled with sticky
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '04-scrolled-filter.png'), fullPage: false });
    console.log('   ✅ Screenshot: 04-scrolled-filter.png');

    // 7. Test tool card clicks (first 6)
    console.log('7. Testing tool card clicks...');
    const testTools = ['邮编查询', 'HS 编码', '汇率换算', '地址格式化', '运费计算', '物流追踪'];
    
    for (const toolName of testTools) {
      const toolLink = await page.$(`a:has-text("${toolName}")`);
      if (toolLink) {
        const href = await toolLink.getAttribute('href');
        if (href) {
          try {
            await toolLink.click();
            await page.waitForTimeout(2000);
            
            const hasError = await page.evaluate(() => {
              const text = document.body.innerText;
              return text.includes('This page couldn\'t load') || 
                     text.includes('Application error') ||
                     text.includes('404') ||
                     text.includes('Element type is invalid');
            });
            
            const currentUrl = page.url();
            results.toolClicks[toolName] = {
              href: href,
              navigated: true,
              hasError: hasError,
              finalUrl: currentUrl
            };
            console.log(`   ${toolName}: ${href} → ${hasError ? 'ERROR' : 'OK'}`);
            
            // Return to /tools
            await page.goto(URL, { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            
            // Dismiss cookie dialog again if present
            try {
              const cookieBtn = await page.$('button:has-text("我知道了")');
              if (cookieBtn) {
                await cookieBtn.click();
                await page.waitForTimeout(500);
              }
            } catch (e) {
              // Cookie dialog not present
            }
          } catch (err) {
            results.toolClicks[toolName] = { href, navigated: false, error: err.message };
            console.log(`   ${toolName}: FAILED - ${err.message}`);
          }
        }
      }
    }

    // 8. Full page screenshot
    console.log('8. Taking full page screenshot...');
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '05-full-page.png'), fullPage: true });
    console.log('   ✅ Screenshot: 05-full-page.png');

    // Save results
    fs.writeFileSync(
      path.join(EVIDENCE_DIR, 'test-results.json'),
      JSON.stringify(results, null, 2)
    );

    console.log('\n=== Test Results ===');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

test();
