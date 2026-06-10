#!/usr/bin/env node
/**
 * scripts/acceptance-v1.20.42.6.36.1.mjs
 * v1.20.42.6.36.1 Acceptance Lock — Playwright automated verification
 */

import { chromium } from 'playwright';

const BASE = 'https://jueshi.net';
const results = [];
let passed = 0, failed = 0;

function log(status, name, detail) {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${status}] ${name}: ${detail}`);
  results.push({ status, name, detail });
  if (status === 'PASS') passed++; else failed++;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Track network failures
  const networkErrors = [];
  page.on('requestfailed', req => {
    networkErrors.push(`${req.url()} — ${req.failure().errorText}`);
  });

  try {
    // ===== 1. Logo verification =====
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    const logoImg = await page.$('img[src*="jueshi-logo"]');
    if (logoImg) {
      const alt = await logoImg.getAttribute('alt');
      log('PASS', 'Logo 图片', `存在, alt="${alt}"`);
    } else {
      log('FAIL', 'Logo 图片', '未找到 img[src*="jueshi-logo"]');
    }

    // ===== 2. /checklists =====
    const clResp = await page.goto(`${BASE}/checklists`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    log(clResp.status() === 200 ? 'PASS' : 'FAIL', '/checklists 状态码', `${clResp.status()}`);
    
    const clCards = await page.$$('a[href^="/checklists/"]');
    log(clCards.length >= 3 ? 'PASS' : 'FAIL', '/checklists 卡片数', `${clCards.length} 张清单卡片`);

    // Check for 3 specific slugs
    const clHtml = await page.content();
    const slugs = ['student-first-abroad-packing-checklist', 'first-shipping-checklist', 'toronto-rental-viewing-checklist'];
    for (const slug of slugs) {
      const found = clHtml.includes(`/checklists/${slug}`);
      log(found ? 'PASS' : 'FAIL', `清单 ${slug}`, found ? '在列表页中' : '未找到');
    }

    // ===== 3. /topics =====
    const tpResp = await page.goto(`${BASE}/topics`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    log(tpResp.status() === 200 ? 'PASS' : 'FAIL', '/topics 状态码', `${tpResp.status()}`);

    // ===== 4. Header navigation structure =====
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const headerHtml = await page.content();

    // Community link
    const communityLink = await page.$('a[href="https://bbs.jueshi.net"][target="_blank"]');
    log(communityLink ? 'PASS' : 'FAIL', '社区外链', communityLink ? 'href=bbs.jueshi.net, target=_blank' : '未找到');

    // Topics link in nav
    const topicsLink = await page.$('a[href="/topics"]');
    log(topicsLink ? 'PASS' : 'FAIL', '主题入口', topicsLink ? '存在 /topics 链接' : '未找到');

    // ===== 5. Tool dropdown — no specific document pages =====
    const forbiddenPaths = [
      '/tools/quote',
      '/tools/quote-sheet',
      '/tools/invoice',
      '/tools/documents/quotation',
      '/tools/documents/commercial-invoice',
      '/tools/handover-note',
      '/tools/debit-note',
    ];
    let hasForbidden = false;
    for (const p of forbiddenPaths) {
      if (headerHtml.includes(`href="${p}"`) && !headerHtml.includes(`href="${p}"`) === false) {
        // Check if it's in the nav/header area specifically
        // Since we're checking the full page, let's be more precise
      }
    }
    // Simpler check: the TOOL_CATEGORIES array in the source should only have category links
    const toolDropdownLinks = await page.$$eval('nav a[href^="/tools"]', els => els.map(e => e.getAttribute('href')));
    const hasSpecificDocs = toolDropdownLinks.some(href => 
      forbiddenPaths.includes(href)
    );
    log(!hasSpecificDocs ? 'PASS' : 'FAIL', '工具下拉无具体单据页', 
      hasSpecificDocs ? `发现: ${toolDropdownLinks.filter(h => forbiddenPaths.includes(h)).join(', ')}` : '仅分类入口');

    // Check for category links
    const hasCatLinks = headerHtml.includes('/tools?cat=documents') || headerHtml.includes('cat=documents');
    log(hasCatLinks ? 'PASS' : 'FAIL', '工具下拉含分类入口', hasCatLinks ? 'cat=documents 等' : '未找到分类链接');

    // ===== 6. Search functionality =====
    // Desktop search input (may be hidden on mobile viewport, so switch to desktop)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    const searchInput = await page.$('input[placeholder*="搜索工具"]');
    if (searchInput) {
      log('PASS', '搜索框存在', '找到 input[placeholder*="搜索工具"]');
      
      // Test search: 报价单
      await searchInput.fill('报价单');
      await page.keyboard.press('Enter');
      await page.waitForURL(/\/tools\?q=/, { timeout: 10000 });
      const url1 = page.url();
      log(url1.includes('q=') ? 'PASS' : 'FAIL', '搜索跳转', `URL: ${url1}`);
      
      // Check results
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      const resultCards1 = await page.$$('a[href^="/tools/"]');
      log(resultCards1.length > 0 ? 'PASS' : 'FAIL', '搜索"报价单"结果', `${resultCards1.length} 个结果`);

      // Test search: invoice
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const searchInput2 = await page.$('input[placeholder*="搜索工具"]');
      await searchInput2.fill('invoice');
      await page.keyboard.press('Enter');
      await page.waitForURL(/\/tools\?q=invoice/, { timeout: 10000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      const resultCards2 = await page.$$('a[href^="/tools/"]');
      log(resultCards2.length > 0 ? 'PASS' : 'FAIL', '搜索"invoice"结果', `${resultCards2.length} 个结果`);
    } else {
      log('FAIL', '搜索框存在', '未找到搜索输入框');
    }

    // ===== 7. Notification (unauthenticated) =====
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const bellLink = await page.$('a[href*="/login"][href*="callbackUrl"]');
    log(bellLink ? 'PASS' : 'FAIL', '通知入口(未登录)', bellLink ? '跳转到 /login?callbackUrl=...' : '未找到');

    // ===== 8. Workspace (unauthenticated) =====
    const wsResp = await page.goto(`${BASE}/workspace`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const wsUrl = page.url();
    log(wsUrl.includes('/login') ? 'PASS' : 'FAIL', '工作台(未登录)跳转', `跳转到: ${wsUrl}`);

    // ===== 9. Mobile 375px — no horizontal scroll =====
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    log(scrollWidth <= clientWidth ? 'PASS' : 'FAIL', '移动端 375px 无横向滚动', 
      `scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);

    // Mobile menu button
    const menuBtn = await page.$('button[aria-label="菜单"]');
    log(menuBtn ? 'PASS' : 'FAIL', '移动端菜单按钮', menuBtn ? '存在' : '未找到');

    // ===== 10. Workspace first-load (incognito, logged-in simulation) =====
    // Create fresh context (incognito)
    const freshContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const freshPage = await freshContext.newPage();
    
    const freshConsoleErrors = [];
    freshPage.on('console', msg => {
      if (msg.type() === 'error') freshConsoleErrors.push(msg.text());
    });
    const freshNetworkErrors = [];
    freshPage.on('requestfailed', req => {
      freshNetworkErrors.push(`${req.url()} — ${req.failure().errorText}`);
    });

    // Navigate to workspace (will redirect to login since not authenticated)
    await freshPage.goto(`${BASE}/workspace`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const freshUrl = freshPage.url();
    log(freshUrl.includes('/login') ? 'PASS' : 'FAIL', '工作台首次加载(新会话)', 
      `未登录正确跳转: ${freshUrl}`);

    // Check for fatal errors on the page
    const hasFatalError = freshConsoleErrors.some(e => 
      e.includes('Uncaught') || e.includes('fatal') || e.includes('Hydration')
    );
    log(!hasFatalError ? 'PASS' : 'FAIL', '工作台无 fatal console error', 
      hasFatalError ? `发现: ${freshConsoleErrors.slice(0, 3).join(' | ')}` : '无 fatal error');

    const hasChunkFail = freshNetworkErrors.some(e => e.includes('chunk'));
    log(!hasChunkFail ? 'PASS' : 'FAIL', '工作台无 chunk load 失败', 
      hasChunkFail ? `发现: ${freshNetworkErrors.slice(0, 3).join(' | ')}` : '无 chunk 失败');

    await freshContext.close();

  } catch (err) {
    console.error(`\n⚠️ 脚本异常: ${err.message}`);
    log('FAIL', '脚本执行', err.message);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`📊 验收结果: ${passed} PASS / ${failed} FAIL / ${passed + failed} TOTAL`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n✅ 全部通过，可进入 v1.20.42.6.37');
  } else {
    console.log(`\n❌ ${failed} 项失败，需修复后重新验收`);
  }

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    version: 'v1.20.42.6.36.1',
    passed,
    failed,
    total: passed + failed,
    results,
  };
  
  const { writeFileSync } = await import('fs');
  writeFileSync('reports/checklist-publish/acceptance-v1.20.42.6.36.1.json', JSON.stringify(report, null, 2));
  console.log('\n📄 报告已写入 reports/checklist-publish/acceptance-v1.20.42.6.36.1.json');
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
