const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Test mobile viewport (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  
  console.log('=== Mobile Viewport Test (390x844) ===');
  
  // Find ToolFilterBar specifically (the div with search input)
  const toolFilterBar = await mobilePage.$('div.bg-white.border-b:has(input[placeholder="搜索工具名称或描述..."])');
  
  if (toolFilterBar) {
    const classes = await toolFilterBar.getAttribute('class');
    console.log('ToolFilterBar classes:', classes);
    
    // Check if it has sticky behavior on mobile
    const hasStickyOnMobile = classes.includes('sticky') && !classes.includes('md:sticky');
    const hasMdSticky = classes.includes('md:sticky');
    
    console.log('Has sticky on mobile (should be false):', hasStickyOnMobile);
    console.log('Has md:sticky (should be true):', hasMdSticky);
    
    // Scroll down and check position
    await mobilePage.evaluate(() => window.scrollTo(0, 800));
    await mobilePage.waitForTimeout(500);
    
    const rect = await toolFilterBar.boundingBox();
    const headerRect = await mobilePage.evaluate(() => {
      const header = document.querySelector('header');
      return header ? header.getBoundingClientRect() : null;
    });
    
    console.log('After scrolling 800px:');
    console.log('  ToolFilterBar top:', rect.y);
    console.log('  Header bottom:', headerRect ? headerRect.bottom : 'N/A');
    
    // On mobile, ToolFilterBar should scroll with the page (not sticky)
    // So its top position should be negative (scrolled out of view) or at its natural position
    const isScrollingWithPage = rect.y < 0 || rect.y > headerRect.bottom;
    console.log('  Is scrolling with page (not sticky):', isScrollingWithPage);
    
    if (!hasStickyOnMobile && hasMdSticky && isScrollingWithPage) {
      console.log('✅ Mobile sticky fix is working correctly');
    } else {
      console.log('❌ Mobile sticky fix has issues');
    }
  } else {
    console.log('❌ Could not find ToolFilterBar');
  }
  
  await mobileContext.close();
  
  // Test desktop viewport (1280x720)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    isMobile: false
  });
  
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('https://i.jueshi.net/tools', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);
  
  console.log('\n=== Desktop Viewport Test (1280x720) ===');
  
  const desktopToolFilterBar = await desktopPage.$('div.bg-white.border-b:has(input[placeholder="搜索工具名称或描述..."])');
  
  if (desktopToolFilterBar) {
    const classes = await desktopToolFilterBar.getAttribute('class');
    console.log('ToolFilterBar classes:', classes);
    
    const hasMdSticky = classes.includes('md:sticky');
    const hasTop80 = classes.includes('top-[80px]');
    
    console.log('Has md:sticky (should be true):', hasMdSticky);
    console.log('Has top-[80px] (should be true):', hasTop80);
    
    // Scroll down and check if it's sticky
    await desktopPage.evaluate(() => window.scrollTo(0, 800));
    await desktopPage.waitForTimeout(500);
    
    const rect = await desktopToolFilterBar.boundingBox();
    const headerRect = await desktopPage.evaluate(() => {
      const header = document.querySelector('header');
      return header ? header.getBoundingClientRect() : null;
    });
    
    console.log('After scrolling 800px:');
    console.log('  ToolFilterBar top:', rect.y);
    console.log('  Header bottom:', headerRect ? headerRect.bottom : 'N/A');
    
    // On desktop, ToolFilterBar should be sticky below header
    const isStickyBelowHeader = Math.abs(rect.y - headerRect.bottom) < 10;
    console.log('  Is sticky below header:', isStickyBelowHeader);
    
    if (hasMdSticky && hasTop80 && isStickyBelowHeader) {
      console.log('✅ Desktop sticky behavior is working correctly');
    } else {
      console.log('❌ Desktop sticky behavior has issues');
    }
  } else {
    console.log('❌ Could not find ToolFilterBar');
  }
  
  await desktopContext.close();
  await browser.close();
})();
