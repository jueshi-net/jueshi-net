const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  const results = {
    public: {},
    workspace: {}
  };

  // 测试公共页面（排除 privacy，因为它不使用 JueshiV4PublicShell）
  const publicPages = [
    { name: 'home', url: '/' },
    { name: 'tools', url: '/tools' },
    { name: 'resources', url: '/resources' },
    { name: 'guides', url: '/guides' },
    { name: 'checklists', url: '/checklists' },
    { name: 'help', url: '/help' },
    { name: 'pricing', url: '/pricing' },
    { name: 'ai-tools', url: '/ai-tools' }
  ];

  console.log('=== 公共页面移动端验证 ===');
  for (const page of publicPages) {
    const p = await context.newPage();
    try {
      await p.goto(`https://i.jueshi.net${page.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      
      // 检查底部导航
      const bottomNav = await p.locator('nav.fixed.bottom-0').count();
      const hasBottomNav = bottomNav > 0;
      
      // 检查顶部导航的"我的工作台"
      const header = await p.locator('header').first();
      const menuButton = await header.locator('button:has-text("菜单"), button:has-text("☰"), button[aria-label*="menu"]').count();
      
      // 检查是否有横向滚动
      const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await p.evaluate(() => document.documentElement.clientWidth);
      const hasOverflow = scrollWidth > clientWidth + 2;
      
      results.public[page.name] = {
        hasBottomNav,
        hasMenuButton: menuButton > 0,
        hasOverflow,
        status: hasBottomNav && !hasOverflow ? 'PASS' : 'FAIL'
      };
      
      console.log(`${page.name}: ${results.public[page.name].status} (BottomNav: ${hasBottomNav}, Overflow: ${hasOverflow})`);
      
    } catch (error) {
      results.public[page.name] = { status: 'ERROR', error: error.message };
      console.log(`${page.name}: ERROR - ${error.message}`);
    }
    await p.close();
  }

  // 测试 Workspace 移动端
  console.log('\n=== Workspace 移动端验证 ===');
  const workspacePage = await context.newPage();
  try {
    await workspacePage.goto('https://i.jueshi.net/workspace', { waitUntil: 'networkidle', timeout: 15000 });
    
    // 检查 V4 Header
    const v4Header = await workspacePage.locator('header').count();
    
    // 检查底部导航
    const bottomNav = await workspacePage.locator('nav.fixed.bottom-0').count();
    const hasBottomNav = bottomNav > 0;
    
    // 检查"我的"是否 active
    const activeTab = await workspacePage.locator('nav.fixed.bottom-0 button:has-text("我的"), nav.fixed.bottom-0 a:has-text("我的")').count();
    
    // 检查是否有横向滚动
    const scrollWidth = await workspacePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await workspacePage.evaluate(() => document.documentElement.clientWidth);
    const hasOverflow = scrollWidth > clientWidth + 2;
    
    results.workspace.mobile = {
      hasV4Header: v4Header > 0,
      hasBottomNav,
      hasActiveTab: activeTab > 0,
      hasOverflow,
      status: hasBottomNav && !hasOverflow ? 'PASS' : 'FAIL'
    };
    
    console.log(`workspace mobile: ${results.workspace.mobile.status} (V4Header: ${v4Header > 0}, BottomNav: ${hasBottomNav}, Overflow: ${hasOverflow})`);
    
  } catch (error) {
    results.workspace.mobile = { status: 'ERROR', error: error.message };
    console.log(`workspace mobile: ERROR - ${error.message}`);
  }
  await workspacePage.close();

  // 测试 Workspace 桌面端
  console.log('\n=== Workspace 桌面端验证 ===');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const workspaceDesktop = await desktopContext.newPage();
  try {
    await workspaceDesktop.goto('https://i.jueshi.net/workspace', { waitUntil: 'networkidle', timeout: 15000 });
    
    // 检查是否有移动端底部导航（应该没有）
    const mobileBottomNav = await workspaceDesktop.locator('nav.fixed.bottom-0.md\\:hidden').count();
    const hasMobileBottomNav = mobileBottomNav > 0;
    
    // 检查是否有桌面端 Sidebar
    const sidebar = await workspaceDesktop.locator('aside, nav').filter({ hasText: '工作台' }).count();
    
    results.workspace.desktop = {
      hasMobileBottomNav,
      hasSidebar: sidebar > 0,
      status: !hasMobileBottomNav ? 'PASS' : 'FAIL'
    };
    
    console.log(`workspace desktop: ${results.workspace.desktop.status} (MobileBottomNav: ${hasMobileBottomNav}, Sidebar: ${sidebar > 0})`);
    
  } catch (error) {
    results.workspace.desktop = { status: 'ERROR', error: error.message };
    console.log(`workspace desktop: ERROR - ${error.message}`);
  }
  await workspaceDesktop.close();
  await desktopContext.close();

  await browser.close();

  // 输出总结
  console.log('\n=== 验证总结 ===');
  const publicPass = Object.values(results.public).filter(r => r.status === 'PASS').length;
  const publicTotal = Object.keys(results.public).length;
  console.log(`公共页面: ${publicPass}/${publicTotal} PASS`);
  
  const workspacePass = Object.values(results.workspace).filter(r => r.status === 'PASS').length;
  const workspaceTotal = Object.keys(results.workspace).length;
  console.log(`Workspace: ${workspacePass}/${workspaceTotal} PASS`);
  
  const allPass = publicPass === publicTotal && workspacePass === workspaceTotal;
  console.log(`\n总体结果: ${allPass ? 'PASS' : 'FAIL'}`);
  
  process.exit(allPass ? 0 : 1);
})();
