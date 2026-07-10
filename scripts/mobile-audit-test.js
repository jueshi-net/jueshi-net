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
    // Navigate to /tools
    await page.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // 1. Check horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    results.noHorizontalOverflow = scrollWidth <= viewportWidth;
    console.log(`✓ 横向溢出检查: scrollWidth=${scrollWidth}, viewportWidth=${viewportWidth}, 通过=${results.noHorizontalOverflow}`);
    
    // 2. Extract tool cards
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
    console.log(`✓ 工具卡片统计: 总数=${toolCards.total}, 唯一=${toolCards.unique}, 空=${toolCards.empty}, 重复=${toolCards.duplicate}`);
    
    // 3. Test menu open/close
    const menuButton = await page.$('button[aria-label="菜单"], button:has-text("☰"), button:has-text("菜单")');
    if (menuButton) {
      await menuButton.click();
      await page.waitForTimeout(500);
      
      const menuOpen = await page.evaluate(() => {
        const menu = document.querySelector('[role="menu"], nav[aria-label="主菜单"], .mobile-menu');
        return menu && menu.offsetParent !== null;
      });
      results.menuOpen = menuOpen;
      console.log(`✓ 菜单打开测试: ${menuOpen ? '通过' : '失败'}`);
      
      // Close menu
      const closeButton = await page.$('button[aria-label="关闭菜单"], button:has-text("×"), button:has-text("关闭")');
      if (closeButton) {
        await closeButton.click();
        await page.waitForTimeout(500);
        
        const menuClosed = await page.evaluate(() => {
          const menu = document.querySelector('[role="menu"], nav[aria-label="主菜单"], .mobile-menu');
          return !menu || menu.offsetParent === null;
        });
        results.menuClose = menuClosed;
        console.log(`✓ 菜单关闭测试: ${menuClosed ? '通过' : '失败'}`);
      }
    } else {
      console.log('⚠ 未找到菜单按钮，跳过菜单测试');
    }
    
    // 4. Test sticky search area
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    
    const stickyCheck = await page.evaluate(() => {
      const stickyElement = document.querySelector('.sticky, [style*="position: sticky"]');
      if (!stickyElement) return { found: false };
      
      const rect = stickyElement.getBoundingClientRect();
      const header = document.querySelector('header, nav[role="navigation"]');
      const headerRect = header ? header.getBoundingClientRect() : null;
      
      const overlaps = headerRect && rect.top < headerRect.bottom && rect.bottom > headerRect.top;
      
      return {
        found: true,
        stickyTop: rect.top,
        headerBottom: headerRect ? headerRect.bottom : null,
        overlaps: overlaps
      };
    });
    
    results.stickyFilterNoHeaderOverlap = stickyCheck.found && !stickyCheck.overlaps;
    console.log(`✓ Sticky 搜索区检查: 找到=${stickyCheck.found}, 覆盖Header=${stickyCheck.overlaps}, 通过=${results.stickyFilterNoHeaderOverlap}`);
    
    // 5. Test tool card clicks (first 6)
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
            console.log(`✓ ${toolName}: ${href} → ${hasError ? '错误' : '成功'}`);
            
            // Return to /tools
            await page.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
          } catch (err) {
            results.toolClicks[toolName] = { href, navigated: false, error: err.message };
            console.log(`✗ ${toolName}: 点击失败 - ${err.message}`);
          }
        }
      }
    }
    
    console.log('\n=== 审计结果 ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error.message);
  } finally {
    await browser.close();
  }
})();
