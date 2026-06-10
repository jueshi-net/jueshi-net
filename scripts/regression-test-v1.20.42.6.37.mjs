#!/usr/bin/env node
/**
 * Regression Test for v1.20.42.6.37
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://jueshi.net';

const PATHS_TO_TEST = [
  { path: '/', expected: 200, name: '首页' },
  { path: '/tools', expected: 200, name: '工具中心' },
  { path: '/tools?cat=logistics', expected: 200, name: '工具分类-物流' },
  { path: '/tools?cat=documents', expected: 200, name: '工具分类-单据' },
  { path: '/tools?cat=life', expected: 200, name: '工具分类-生活' },
  { path: '/tools?cat=ai-content', expected: 200, name: '工具分类-AI' },
  { path: '/tools?q=邮编', expected: 200, name: '搜索-邮编' },
  { path: '/tools?q=HS编码', expected: 200, name: '搜索-HS编码' },
  { path: '/tools?q=汇率', expected: 200, name: '搜索-汇率' },
  { path: '/tools?q=报价单', expected: 200, name: '搜索-报价单' },
  { path: '/tools?q=invoice', expected: 200, name: '搜索-invoice' },
  { path: '/tools/postal-code', expected: 200, name: '邮编查询' },
  { path: '/tools/hs-code', expected: 200, name: 'HS编码查询' },
  { path: '/tools/exchange-rate', expected: 200, name: '汇率换算' },
  { path: '/tools/address-formatter', expected: 200, name: '地址格式化' },
  { path: '/tools/shipping-calculator', expected: 200, name: '运费计算器' },
  { path: '/tools/documents/quotation', expected: 200, name: '报价单生成器' },
  { path: '/tools/commercial-invoice', expected: 200, name: '商业发票生成器' },
  { path: '/checklists', expected: 200, name: '清单列表' },
  { path: '/checklists/student-first-abroad-packing-checklist', expected: 200, name: '清单-留学行李' },
  { path: '/checklists/first-shipping-checklist', expected: 200, name: '清单-首次集运' },
  { path: '/checklists/toronto-rental-viewing-checklist', expected: 200, name: '清单-多伦多租房' },
  { path: '/topics', expected: 200, name: '专题' },
  { path: '/community', expected: 200, name: '社区' },
  { path: '/sitemap.xml', expected: 200, name: 'Sitemap' },
  { path: '/robots.txt', expected: 200, name: 'Robots' },
  { path: '/admin', expected: 307, name: 'Admin(重定向)' },
  { path: '/workspace', expected: 307, name: 'Workspace(重定向)' },
];

async function runTests() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of PATHS_TO_TEST) {
    try {
      const response = await page.goto(`${BASE_URL}${test.path}`, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      const status = response.status();
      const success = status === test.expected;
      
      results.push({
        path: test.path,
        name: test.name,
        expected: test.expected,
        actual: status,
        success,
      });

      if (success) {
        passed++;
        console.log(`✅ ${test.name}: ${status}`);
      } else {
        failed++;
        console.log(`❌ ${test.name}: expected ${test.expected}, got ${status}`);
      }
    } catch (error) {
      failed++;
      results.push({
        path: test.path,
        name: test.name,
        expected: test.expected,
        actual: 'error',
        success: false,
        error: error.message,
      });
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  await browser.close();

  console.log(`\n=== 回归测试结果 ===`);
  console.log(`通过: ${passed}/${PATHS_TO_TEST.length}`);
  console.log(`失败: ${failed}/${PATHS_TO_TEST.length}`);

  if (failed === 0) {
    console.log('\n✅ 所有回归测试通过！');
    return true;
  } else {
    console.log('\n❌ 有测试失败，请检查');
    return false;
  }
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
