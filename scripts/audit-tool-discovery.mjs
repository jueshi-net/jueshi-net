#!/usr/bin/env node
/**
 * Tool Discovery Audit Script
 * 审计工具发现效率和核心工具页 SEO 状态
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://jueshi.net';

const CORE_TOOLS = [
  { path: '/tools/postal-code', name: '邮编查询' },
  { path: '/tools/hs-code', name: 'HS编码查询' },
  { path: '/tools/exchange-rate', name: '汇率换算' },
  { path: '/tools/address-formatter', name: '地址格式化' },
  { path: '/tools/shipping-calculator', name: '运费计算器' },
  { path: '/tools/documents/quotation', name: '报价单生成器' },
  { path: '/tools/commercial-invoice', name: '商业发票生成器' },
];

const SEARCH_QUERIES = [
  '邮编',
  'HS编码',
  '汇率',
  '报价单',
  'invoice',
];

async function audit() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    toolsPage: null,
    categoryFilters: [],
    searchResults: [],
    coreTools: [],
    brandResidue: [],
    issues: [],
  };

  try {
    // 1. 审计 /tools 页面
    console.log('审计 /tools 页面...');
    await page.goto(`${BASE_URL}/tools`, { waitUntil: 'networkidle' });
    const toolsTitle = await page.title();
    const toolsHasResults = await page.locator('text=/\\d+ 个工具可用/').count() > 0;
    results.toolsPage = {
      title: toolsTitle,
      hasResults: toolsHasResults,
      status: 'pass',
    };

    // 2. 审计分类过滤
    console.log('审计分类过滤...');
    const categories = ['logistics', 'documents', 'life', 'ai-content'];
    for (const cat of categories) {
      await page.goto(`${BASE_URL}/tools?cat=${cat}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000); // 等待内容加载
      const hasResults = await page.locator('text=/\\d+ 个工具可用/').count() > 0;
      results.categoryFilters.push({
        category: cat,
        hasResults,
        status: hasResults ? 'pass' : 'warning',
      });
    }

    // 3. 审计搜索功能
    console.log('审计搜索功能...');
    for (const query of SEARCH_QUERIES) {
      await page.goto(`${BASE_URL}/tools?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      const hasResults = await page.locator('text=/共找到 \\d+ 个匹配项/').count() > 0;
      const hasEmptyState = await page.locator('text=/没有找到.*相关的工具/').count() > 0;
      results.searchResults.push({
        query,
        hasResults,
        hasEmptyState,
        status: (hasResults || hasEmptyState) ? 'pass' : 'fail',
      });
    }

    // 4. 审计核心工具页
    console.log('审计核心工具页...');
    for (const tool of CORE_TOOLS) {
      await page.goto(`${BASE_URL}${tool.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      const title = await page.title();
      const hasH1 = await page.locator('h1').count() > 0;
      const hasBrandResidue = title.includes('海外百宝箱');
      
      results.coreTools.push({
        path: tool.path,
        name: tool.name,
        title,
        hasH1,
        hasBrandResidue,
        status: (hasH1 && !hasBrandResidue) ? 'pass' : 'fail',
      });

      if (hasBrandResidue) {
        results.brandResidue.push({
          path: tool.path,
          title,
        });
      }
    }

    // 5. 检查品牌残留
    console.log('检查品牌残留...');
    const allPages = [
      '/',
      '/tools',
      '/checklists',
      '/topics',
      '/community',
    ];

    for (const path of allPages) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      const title = await page.title();
      if (title.includes('海外百宝箱')) {
        results.brandResidue.push({
          path,
          title,
        });
      }
    }

    // 6. 总结问题
    if (results.brandResidue.length > 0) {
      results.issues.push({
        type: 'brand-residue',
        message: `发现 ${results.brandResidue.length} 处品牌残留（海外百宝箱）`,
        details: results.brandResidue,
      });
    }

    const failedTools = results.coreTools.filter(t => t.status === 'fail');
    if (failedTools.length > 0) {
      results.issues.push({
        type: 'core-tool-issues',
        message: `${failedTools.length} 个核心工具页存在问题`,
        details: failedTools,
      });
    }

    const failedSearch = results.searchResults.filter(s => s.status === 'fail');
    if (failedSearch.length > 0) {
      results.issues.push({
        type: 'search-issues',
        message: `${failedSearch.length} 个搜索查询失败`,
        details: failedSearch,
      });
    }

  } catch (error) {
    console.error('审计过程出错:', error);
    results.issues.push({
      type: 'audit-error',
      message: error.message,
    });
  } finally {
    await browser.close();
  }

  // 输出结果
  console.log('\n=== 审计结果 ===');
  console.log(JSON.stringify(results, null, 2));

  // 保存结果
  const fs = await import('fs');
  const path = await import('path');
  const reportDir = path.join(process.cwd(), 'reports/tool-discovery-polish');
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(
    path.join(reportDir, 'audit-result.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n审计报告已保存到 reports/tool-discovery-polish/audit-result.json');

  // 返回是否有问题
  return results.issues.length === 0;
}

audit().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
