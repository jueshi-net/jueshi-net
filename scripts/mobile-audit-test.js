const { chromium } = require('playwright');

(async () => {
  const results = {
    menuOpen: false,
    menuClose: false,
    menuNavigation: false,
    stickyFilterNoOverlap: false,
    noHorizontalOverflow: false,
    toolCards: { total: 0, unique: 0, empty: 0, duplicate: 0 },
    toolClicks: {},
    screenshots: {}
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();
  
  console.log('=== 开始移动端审计测试 (390x844) ===\n');

  // 1. 导航到 /tools
  await page.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 关闭 cookie 弹窗
  try {
    const cookieBtn = await page.$('button:has-text("我知道了")');
    if (cookieBtn) await cookieBtn.click();
    await page.waitForTimeout(500);
  } catch(e) {}

  // 截图：首屏
  await page.screenshot({ path: 'docs/evidence/tools-mobile-v2-audit/01-viewport-first.png', fullPage: false });
  console.log('✓ 首屏截图已保存');

  // 2. 检查横向溢出
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  results.noHorizontalOverflow = scrollWidth <= viewportWidth;
  console.log(`✓ 横向溢出检查: scrollWidth=${scrollWidth}, viewportWidth=${viewportWidth}, 通过=${results.noHorizontalOverflow}`);

  // 3. 提取工具卡片 - 使用更宽泛的选择器
  const toolCards = await page.evaluate(() => {
    // 找到所有包含"立即使用"按钮的卡片容器
    const allButtons = Array.from(document.querySelectorAll('button'));
    const useButtons = allButtons.filter(b => b.textContent.includes('立即使用'));
    
    // 找到所有 /tools/ 链接
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    const toolLinks = allLinks.filter(a => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('/tools/') && !href.includes('/tools/documents/') && !href.includes('/tools/template-studio');
    });
    
    const hrefs = toolLinks.map(a => a.getAttribute('href'));
    const uniqueHrefs = [...new Set(hrefs)];
    const emptyHrefs = hrefs.filter(h => !h || h.trim() === '');
    
    const hrefCounts = {};
    hrefs.forEach(h => { hrefCounts[h] = (hrefCounts[h] || 0) + 1; });
    const duplicateHrefs = Object.entries(hrefCounts).filter(([_, count]) => count > 1);

    return {
      total: useButtons.length,
      uniqueLinks: uniqueHrefs.length,
      empty: emptyHrefs.length,
      duplicate: duplicateHrefs.length,
      hrefs: uniqueHrefs
    };
  });
  results.toolCards = toolCards;
  console.log(`✓ 工具卡片统计: "立即使用"按钮=${toolCards.total}, 唯一工具链接=${toolCards.uniqueLinks}, 空=${toolCards.empty}, 重复=${toolCards.duplicate}`);

  // 4. 测试菜单打开/关闭 - 使用截图中的汉堡菜单
  // 从截图看，菜单按钮在右上角，是一个  图标
  const menuButton = await page.$('header button:last-child, nav button:last-of-type, [class*="menu"] button, button[aria-label*="menu"], button[aria-label*="菜单"]');
  
  // 尝试多种选择器
  let foundMenuButton = false;
  const possibleSelectors = [
    'header button:last-child',
    'nav button:last-of-type', 
    'button:has(svg)',
    'header a:last-child button',
    '[class*="mobile"] button',
    'button[class*="hamburger"]',
    'button[class*="menu"]'
  ];
  
  for (const selector of possibleSelectors) {
    const btn = await page.$(selector);
    if (btn) {
      const box = await btn.boundingBox();
      if (box && box.x > 300) { // 右上角
        await btn.click();
        foundMenuButton = true;
        break;
      }
    }
  }
  
  if (!foundMenuButton) {
    // 直接点击右上角区域
    await page.click('body', { position: { x: 360, y: 35 } });
    foundMenuButton = true;
  }
  
  await page.waitForTimeout(1000);
  
  // 检查菜单是否打开
  const menuState = await page.evaluate(() => {
    // 检查是否有侧边栏或下拉菜单出现
    const drawers = document.querySelectorAll('[class*="drawer"], [class*="sidebar"], [class*="menu"], nav[aria-label]');
    const visibleDrawers = Array.from(drawers).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
    });
    return visibleDrawers.length > 0;
  });
  
  results.menuOpen = menuState;
  console.log(`✓ 菜单打开测试: ${menuState ? '通过' : '失败'}`);

  // 截图：菜单展开
  await page.screenshot({ path: 'docs/evidence/tools-mobile-v2-audit/02-menu-open.png', fullPage: false });
  console.log('✓ 菜单展开截图已保存');

  // 关闭菜单 - 点击遮罩或关闭按钮
  if (menuState) {
    // 尝试点击遮罩层
    await page.click('body', { position: { x: 100, y: 400 } });
    await page.waitForTimeout(500);
    
    const menuClosed = await page.evaluate(() => {
      const drawers = document.querySelectorAll('[class*="drawer"], [class*="sidebar"], [class*="menu"]');
      const visibleDrawers = Array.from(drawers).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
      });
      return visibleDrawers.length === 0;
    });
    results.menuClose = menuClosed;
    console.log(`✓ 菜单关闭测试: ${menuClosed ? '通过' : '失败'}`);
  }

  // 5. 测试工具卡片点击
  const testTools = [
    { name: '邮编查询', selector: 'a[href="/tools/postal-code"]' },
    { name: 'HS 编码', selector: 'a[href="/tools/hs-code"]' },
    { name: '汇率换算', selector: 'a[href="/tools/exchange-rate"]' },
    { name: '地址格式化', selector: 'a[href="/tools/address-formatter"]' },
    { name: '运费计算', selector: 'a[href="/tools/shipping-calculator"]' },
    { name: '物流追踪', selector: 'a[href*="tracking"], a:has-text("物流追踪")' }
  ];
  
  for (const tool of testTools) {
    try {
      const link = await page.$(tool.selector);
      if (link) {
        const href = await link.getAttribute('href');
        await link.click();
        await page.waitForTimeout(2000);
        
        const hasError = await page.evaluate(() => {
          const text = document.body.innerText;
          return text.includes("This page couldn't load") || 
                 text.includes('Application error') ||
                 text.includes('Element type is invalid');
        });
        
        results.toolClicks[tool.name] = {
          href: href,
          navigated: true,
          hasError: hasError,
          finalUrl: page.url()
        };
        console.log(`✓ ${tool.name}: ${href} → ${hasError ? '错误' : '成功'}`);
        
        await page.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        // 重新关闭 cookie
        try {
          const cookieBtn = await page.$('button:has-text("我知道了")');
          if (cookieBtn) await cookieBtn.click();
          await page.waitForTimeout(500);
        } catch(e) {}
      } else {
        results.toolClicks[tool.name] = { navigated: false, reason: '元素未找到' };
        console.log(` ${tool.name}: 元素未找到`);
      }
    } catch (err) {
      results.toolClicks[tool.name] = { navigated: false, error: err.message };
      console.log(`✗ ${tool.name}: ${err.message}`);
    }
  }

  // 6. 测试 sticky 搜索区
  await page.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  try {
    const cookieBtn = await page.$('button:has-text("我知道了")');
    if (cookieBtn) await cookieBtn.click();
    await page.waitForTimeout(500);
  } catch(e) {}

  // 获取 header 高度
  const headerHeight = await page.evaluate(() => {
    const header = document.querySelector('header');
    return header ? header.getBoundingClientRect().bottom : 0;
  });
  
  // 滚动 800px
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  
  // 截图：滚动后
  await page.screenshot({ path: 'docs/evidence/tools-mobile-v2-audit/03-scrolled-sticky.png', fullPage: false });
  console.log('✓ 滚动后截图已保存');

  // 检查 sticky 元素位置
  const stickyCheck = await page.evaluate((hHeight) => {
    const stickyEl = document.querySelector('[class*="sticky"]');
    if (!stickyEl) return { found: false };
    
    const rect = stickyEl.getBoundingClientRect();
    const header = document.querySelector('header');
    const headerRect = header ? header.getBoundingClientRect() : null;
    
    // sticky 应该在 header 下方，不覆盖 header
    const overlaps = headerRect && rect.top < headerRect.bottom;
    const isBelowHeader = headerRect && rect.top >= headerRect.bottom - 5; // 允许5px误差
    
    return {
      found: true,
      stickyTop: rect.top,
      headerBottom: headerRect ? headerRect.bottom : null,
      overlaps: overlaps,
      isBelowHeader: isBelowHeader,
      headerHeight: hHeight
    };
  }, headerHeight);
  
  results.stickyFilterNoOverlap = stickyCheck.found && !stickyCheck.overlaps;
  console.log(`✓ Sticky 搜索区: 找到=${stickyCheck.found}, stickyTop=${stickyCheck.stickyTop}, headerBottom=${stickyCheck.headerBottom}, 覆盖Header=${stickyCheck.overlaps}, 在Header下方=${stickyCheck.isBelowHeader}, 通过=${results.stickyFilterNoOverlap}`);

  // 7. 完整页面截图
  await page.screenshot({ path: 'docs/evidence/tools-mobile-v2-audit/04-full-page.png', fullPage: true });
  console.log('✓ 完整页面截图已保存');

  await browser.close();

  // 输出结果
  console.log('\n=== 审计结果 ===');
  console.log(JSON.stringify(results, null, 2));
})();
