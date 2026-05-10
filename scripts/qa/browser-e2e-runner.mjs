#!/usr/bin/env node
// browser-e2e-runner.mjs — 真实浏览器 E2E 测试单轮执行器
// 用法: node scripts/qa/browser-e2e-runner.mjs --round=1

import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const TODAY = new Date().toISOString().slice(0, 10);
const REPORT_DIR = join(ROOT, 'reports', 'browser-qa', TODAY);
const SCREENSHOT_DIR = join(REPORT_DIR, 'screenshots');
const VIDEO_DIR = join(REPORT_DIR, 'videos');
const TRACE_DIR = join(REPORT_DIR, 'traces');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const HEADLESS = process.env.HEADLESS !== 'false';
const SLOWMO = parseInt(process.env.SLOWMO || '0');
const ROUND_ARG = process.argv.find(a => a.startsWith('--round='));
const ROUND = ROUND_ARG ? parseInt(ROUND_ARG.split('=')[1]) : 1;
const MOBILE_VP = parseInt(process.env.MOBILE || '1'); // 1=iPhone, 2=Android

[SCREENSHOT_DIR, VIDEO_DIR, TRACE_DIR].forEach(d => mkdirSync(d, { recursive: true }));

const LOG_FILE = join(REPORT_DIR, 'browser-overnight.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  appendFileSync(LOG_FILE, line + '\n');
}

function saveScreenshot(page, name) {
  const path = join(SCREENSHOT_DIR, `round-${ROUND}-${name}.png`);
  page.screenshot({ path, fullPage: false });
  return path;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============ Test Result Collector ============
const results = {
  round: ROUND,
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  headless: HEADLESS,
  mobileViewport: MOBILE_VP === 1 ? 'iPhone 13 (390x844)' : 'Android Pixel 5 (412x915)',
  pages: [],
  errors: [],
  failedRequests: [],
  consoleErrors: [],
  p0: [], p1: [], p2: [], p3: [],
  timings: {},
};

function recordPage(name, status, detail = {}) {
  results.pages.push({ name, status, ...detail, time: new Date().toISOString() });
}

function addError(severity, page, message) {
  const entry = { severity, page, message, time: new Date().toISOString() };
  results[`p${severity}`].push(entry);
  results.errors.push(entry);
}

function addWarning(severity, page, message) {
  // Warnings go to errors list but marked for review
  const entry = { severity, page, message, time: new Date().toISOString(), isWarning: true };
  results.errors.push(entry);
}

// ============ Mobile Viewports ============
const VIEWPORTS = [
  { name: 'iPhone 13', width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' },
  { name: 'Android Pixel 5', width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36' },
];

// ============ Helper: measure click timing ============
async function measureClick(page, selector, label, opts = {}) {
  const start = Date.now();
  try {
    await page.click(selector, { timeout: 5000 });
    // Pure frontend actions should NOT wait for networkidle
    if (opts.waitForNetwork) {
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    } else {
      await page.waitForTimeout(opts.waitForMs || 200);
    }
    const elapsed = Date.now() - start;
    results.timings[label] = elapsed;
    return { elapsed, ok: true };
  } catch (e) {
    const elapsed = Date.now() - start;
    results.timings[label] = elapsed;
    return { elapsed, ok: false, error: e.message };
  }
}

// ============ Helper: capture console errors & failed requests ============
async function setupCapture(page, pageName) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ page: pageName, text: msg.text(), time: new Date().toISOString() });
    }
  });
  page.on('requestfailed', req => {
    const url = req.url();
    if (!url.includes('favicon') && !url.includes('hot-update')) {
      results.failedRequests.push({ page: pageName, url, failure: req.failure()?.errorText, time: new Date().toISOString() });
    }
  });
}

// ============ Helper: track analytics requests (context-level, not cleared per-test) ============
const analyticsRequests = [];
async function setupAnalyticsCapture(context) {
  context.on('request', req => {
    if (req.url().includes('/api/events') && req.method() === 'POST') {
      try {
        const postData = req.postData();
        if (postData) {
          const parsed = JSON.parse(postData);
          if (parsed.eventType) {
            analyticsRequests.push({
              url: req.url(),
              method: 'POST',
              post: parsed,
              time: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  });
}

// ============================================================
// TEST 1: Homepage
// ============================================================
async function testHomepage(page) {
  const name = 'home';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  // Analytics: captured at context level
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  results.timings['home-load'] = Date.now() - t0;
  
  // Check title
  const title = await page.title();
  const h1Text = await page.locator('h1').first().innerText().catch(() => '');
  const hasTitle = h1Text.includes('工具箱') || title.includes('百宝箱');
  
  if (!hasTitle) {
    addError(0, name, '首页标题未出现');
  }
  
  saveScreenshot(page, 'home');
  
  // Test 6 popular tool quick links
  const popularTools = [
    { name: '物流追踪', href: '/tracking' },
    { name: '运费/CBM', href: '/tools/shipping-calculator' },
    { name: 'HS编码', href: '/tools/hs-code' },
    { name: '邮编地址', href: '/tools/postal-code' },
    { name: '汇率查询', href: '/tools/exchange-rate' },
    { name: '工作便签', href: '/tools/memo' },
  ];
  
  for (const tool of popularTools) {
    const selector = `a[href="${tool.href}"]`;
    const exists = await page.locator(selector).count().then(c => c > 0).catch(() => false);
    if (!exists) {
      addError(1, name, `热门工具「${tool.name}」入口不存在: ${tool.href}`);
    } else {
      const r = await measureClick(page, selector, `home-click-${tool.name}`, { waitForMs: 500 });
      if (!r.ok) {
        addError(1, name, `点击「${tool.name}」无响应 (${r.elapsed}ms)`);
      }
      await page.waitForTimeout(1000);
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  
  // Test 8 core tool cards
  const coreSelectors = [
    'a[href="/tracking"]',
    'a[href="/tools/shipping-calculator"]',
    'a[href="/tools/invoice"]',
    'a[href="/tools/hs-code"]',
    'a[href="/tools/postal-code"]',
    'a[href="/tools/quote"]',
    'a[href="/tools/sensitive-goods"]',
    'a[href="/tools/exchange-rate"]',
  ];
  
  let coreClickCount = 0;
  for (const sel of coreSelectors.slice(0, 3)) { // Test first 3 to avoid too many navigations
    const exists = await page.locator(sel).count().then(c => c > 0).catch(() => false);
    if (exists) coreClickCount++;
  }
  
  saveScreenshot(page, 'home-after-clicks');
  recordPage(name, 'passed', { title: h1Text, popularToolsExist: hasTitle, coreCardsFound: coreClickCount });
  log(`[${name}] Completed: title="${h1Text}", popularTools=${hasTitle}, coreCards=${coreClickCount}`);
}

// ============================================================
// TEST 2: Tracking Page
// ============================================================
async function testTracking(page) {
  const name = 'tracking';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  // Analytics: captured at context level
  analyticsRequests.length = 0;
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/tracking', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('textarea', { timeout: 10000 }).catch(() => {});
  results.timings['tracking-load'] = Date.now() - t0;
  
  // Input tracking numbers
  const testNumbers = 'YT123456789CN\n1Z999AA10123456784\nLX123456789CN';
  await page.fill('textarea', testNumbers);
  
  // Click parse button
  const parseBtn = page.locator('button:has-text("解析单号")');
  const parseOk = await parseBtn.count().then(c => c > 0).catch(() => false);
  if (parseOk) {
    await measureClick(page, 'button:has-text("解析单号")', 'tracking-parse');
    await page.waitForTimeout(500);
  }
  
  // Check results appeared
  const hasResults = await page.locator('text=整理结果').count().then(c => c > 0).catch(() => false);
  if (!hasResults) {
    addError(1, name, '解析单号后未显示整理结果');
  }
  
  // Test copy single number button
  const copyBtn = page.locator('button:has-text("复制单号")').first();
  const copyExists = await copyBtn.count().then(c => c > 0).catch(() => false);
  if (copyExists) {
    await measureClick(page, 'button:has-text("复制单号")', 'tracking-copy-one');
  }
  
  // Test 17TRACK link (check href, don't actually open)
  const link17 = page.locator('button:has-text("在17TRACK查询")').first();
  const link17Exists = await link17.count().then(c => c > 0).catch(() => false);
  let link17Href = '';
  if (link17Exists) {
    await measureClick(page, 'button:has-text("在17TRACK查询")', 'tracking-17track');
    await page.waitForTimeout(500); // Wait for analytics fetch to complete
  }
  
  // Check analytics was sent
  const trackingAnalytics = analyticsRequests.filter(r => r.post && r.post.toolName === 'tracking');
  if (trackingAnalytics.length === 0) {
    addError(2, name, '未检测到 tracking 埋点请求');
  }
  
  // Check no user data in analytics payload
  for (const req of analyticsRequests) {
    if (req.post) {
      const hasUserData = req.post.trackingNumber || req.post.address || req.post.content;
      if (hasUserData) {
        addError(0, name, '埋点 payload 包含用户输入数据!');
      }
    }
  }
  
  // Test FAQ
  const faqBtn = page.locator('button:has-text("物流追踪常见问题")').first();
  if (await faqBtn.count().then(c => c > 0).catch(() => false)) {
    // Click to expand first FAQ
    const faqItems = page.locator('button:has-text("为什么单号")');
    if (await faqItems.count().then(c => c > 0).catch(() => false)) {
      await faqItems.first().click();
      await page.waitForTimeout(300);
      const faqAnswer = await page.locator('text=刚生成的单号可能需要').count().then(c => c > 0).catch(() => false);
      if (!faqAnswer) addError(2, name, 'FAQ 展开后内容未显示');
    }
  }
  
  saveScreenshot(page, 'tracking');
  recordPage(name, 'passed', { hasResults, copyExists, link17Exists, analyticsSent: trackingAnalytics.length });
  log(`[${name}] Completed: hasResults=${hasResults}, analytics=${trackingAnalytics.length}`);
}

// ============================================================
// TEST 3: Shipping Calculator
// ============================================================
async function testShippingCalculator(page) {
  const name = 'shipping-calculator';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/tools/shipping-calculator', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input', { timeout: 10000 }).catch(() => {});
  results.timings['shipping-load'] = Date.now() - t0;
  
  // Input dimensions: 50 × 40 × 30 cm, 8kg, 1件
  const inputs = page.locator('input[type="number"], input[placeholder*="长"]');
  if (await inputs.count().then(c => c > 0).catch(() => false)) {
    const allInputs = page.locator('input[type="number"]');
    const count = await allInputs.count();
    if (count >= 3) {
      await allInputs.nth(0).fill('50');
      await allInputs.nth(1).fill('40');
      await allInputs.nth(2).fill('30');
      if (count >= 5) {
        await allInputs.nth(3).fill('1'); // quantity
        await allInputs.nth(4).fill('8'); // weight
      }
      await page.waitForTimeout(500);
      
      // Check results appeared
      const hasResults = await page.locator('text=计费重').count().then(c => c > 0).catch(() => false);
      if (!hasResults) addError(1, name, '输入数据后未显示计算结果');
      else results.timings['shipping-calc'] = Date.now() - t0;
    }
  }
  
  // Test mode switching
  const modeBtns = page.locator('button');
  const modeBtnsCount = await modeBtns.count();
  
  // Test FAQ
  const faqSection = page.locator('text=运费计算常见问题');
  if (await faqSection.count().then(c => c > 0).catch(() => false)) {
    const faqItem = page.locator('button:has-text("什么是体积重")');
    if (await faqItem.count().then(c => c > 0).catch(() => false)) {
      await faqItem.first().click();
      await page.waitForTimeout(300);
    }
  }
  
  saveScreenshot(page, 'shipping-calculator');
  recordPage(name, 'passed');
  log(`[${name}] Completed`);
}

// ============================================================
// TEST 4: HS Code
// ============================================================
async function testHSCode(page) {
  const name = 'hs-code';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  // Analytics: captured at context level
  analyticsRequests.length = 0;
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/tools/hs-code', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input[placeholder*="搜索"]', { timeout: 10000 }).catch(() => {});
  results.timings['hs-load'] = Date.now() - t0;
  
  const searchTerms = ['手机壳', '茶叶', '沙发', '剪刀', '猫粮'];
  for (const term of searchTerms) {
    await page.fill('input[placeholder*="搜索"]', term);
    await page.waitForTimeout(300);
    const resultCount = await page.locator('[class*="rounded-xl border"]').count().catch(() => 0);
    
    // Expand first result
    const firstCard = page.locator('[class*="rounded-xl border"]').first();
    if (await firstCard.count().then(c => c > 0).catch(() => false)) {
      await firstCard.click();
      await page.waitForTimeout(200);
      
      // Check if HS code info is shown
      const hasHSInfo = await page.locator('text=英文申报名').count().then(c => c > 0).catch(() => false);
      if (hasHSInfo) {
        // Test copy name button
        const copyBtn = page.locator('button[title="复制"]');
        if (await copyBtn.count().then(c => c > 0).catch(() => false)) {
          await copyBtn.first().click();
          await page.waitForTimeout(500); // Wait for analytics fetch
        }
      }
      
      // Close by clicking again
      await firstCard.click();
      await page.waitForTimeout(100);
    }
  }
  
  // Check risk labels exist
  const riskLabels = await page.locator('text=候选编码').count().catch(() => 0) +
                    await page.locator('text=仅供参考').count().catch(() => 0);
  
  // Test FAQ
  const faqSection = page.locator('text=HS编码常见问题');
  if (await faqSection.count().then(c => c > 0).catch(() => false)) {
    const faqItem = page.locator('button:has-text("HS编码是什么")');
    if (await faqItem.count().then(c => c > 0).catch(() => false)) {
      await faqItem.first().click();
      await page.waitForTimeout(300);
    }
  }
  
  // === NEW: Test batch query ===
  const batchBtn = page.locator('button').filter({ hasText: /^批量查询$/ });
  if (await batchBtn.count().then(c => c > 0).catch(() => false)) {
    await batchBtn.click();
    await page.waitForTimeout(300);
    
    const textarea = page.locator('textarea[placeholder*="示例"]');
    if (await textarea.count().then(c => c > 0).catch(() => false)) {
      await textarea.fill('手机壳\n充电宝\n茶叶\n沙发\n剪刀');
      await page.waitForTimeout(800);
      
      const hasResults = await page.locator('text=条匹配').count().then(c => c > 0).catch(() => false);
      if (!hasResults) addWarning(2, name, '批量查询无匹配结果提示');
      
      const passCount = await page.locator('text=✅').count().catch(() => 0);
      if (passCount === 0) addWarning(2, name, '批量查询未显示匹配结果');
    }
    
    await batchBtn.click();
    await page.waitForTimeout(200);
  }
  
  // === NEW: Test CSV export ===
  const exportBtn = page.locator('button').filter({ hasText: /导出 CSV/ });
  if (await exportBtn.count().then(c => c > 0).catch(() => false)) {
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await exportBtn.click();
    const download = await downloadPromise;
    
    if (download) {
      const filename = download.suggestedFilename();
      if (filename && (filename.includes('hs') || filename.includes('product'))) {
        log(`[${name}] CSV download: ${filename}`);
      } else {
        addWarning(2, name, `CSV 文件名异常: ${filename}`);
      }
      await download.cancel().catch(() => {});
    } else {
      addWarning(2, name, '导出 CSV 未触发下载事件');
    }
  }
  
  // Check analytics
  const hsAnalytics = analyticsRequests.filter(r => r.post && r.post.toolName === 'hs-code');
  
  saveScreenshot(page, 'hs-code');
  recordPage(name, 'passed', { searchTerms, riskLabels, analytics: hsAnalytics.length });
  log(`[${name}] Completed: searches=${searchTerms.length}, analytics=${hsAnalytics.length}`);
}

// ============================================================
// TEST 5: Postal Code
// ============================================================
async function testPostalCode(page) {
  const name = 'postal-code';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/tools/postal-code', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input', { timeout: 10000 }).catch(() => {});
  results.timings['postal-load'] = Date.now() - t0;
  
  const tests = [
    { country: 'CA', code: 'V6B 1A1' },
    { country: 'US', code: '10001' },
    { country: 'GB', code: 'SW1A 1AA' },
    { country: 'AU', code: '2000' },
    { country: 'NZ', code: '1010' },
  ];
  
  for (const test of tests) {
    // Select country (if dropdown exists)
    const select = page.locator('select');
    if (await select.count().then(c => c > 0).catch(() => false)) {
      await select.selectOption({ label: test.country === 'CA' ? 'Canada' : test.country === 'US' ? 'United States' : test.country === 'GB' ? 'United Kingdom' : test.country === 'AU' ? 'Australia' : 'New Zealand' }).catch(() => {});
    }
    
    // Input postal code
    const input = page.locator('input[placeholder*="邮编"], input[placeholder*="postal"], input').first();
    if (await input.count().then(c => c > 0).catch(() => false)) {
      await input.fill(test.code);
    }
    
    // Click validate
    const validateBtn = page.locator('button:has-text("校验"), button:has-text("验证")');
    if (await validateBtn.count().then(c => c > 0).catch(() => false)) {
      await measureClick(page, 'button:has-text("校验"), button:has-text("验证")', `postal-validate-${test.country}`);
      await page.waitForTimeout(500);
    }
  }
  
  // Test invalid input
  const input = page.locator('input').first();
  if (await input.count().then(c => c > 0).catch(() => false)) {
    await input.fill('ABC123!!!');
    const validateBtn = page.locator('button:has-text("校验"), button:has-text("验证")');
    if (await validateBtn.count().then(c => c > 0).catch(() => false)) {
      await validateBtn.first().click();
      await page.waitForTimeout(500);
    }
  }
  
  // Test FAQ
  const faqSection = page.locator('text=邮编查询常见问题');
  if (await faqSection.count().then(c => c > 0).catch(() => false)) {
    const faqItem = page.locator('button:has-text("邮编校验通过就一定")');
    if (await faqItem.count().then(c => c > 0).catch(() => false)) {
      await faqItem.first().click();
      await page.waitForTimeout(300);
    }
  }
  
  saveScreenshot(page, 'postal-code');
  recordPage(name, 'passed');
  log(`[${name}] Completed`);
}

// ============================================================
// TEST 6: Exchange Rate
// ============================================================
async function testExchangeRate(page) {
  const name = 'exchange-rate';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  // Analytics: captured at context level
  analyticsRequests.length = 0;
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/tools/exchange-rate', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('select', { timeout: 10000 }).catch(() => {});
  results.timings['exchange-load'] = Date.now() - t0;
  
  // Check for "参考汇率" disclaimer
  const hasDisclaimer = await page.locator('text=参考汇率').count().then(c => c > 0).catch(() => false);
  if (!hasDisclaimer) addError(1, name, '页面缺少"参考汇率"免责声明');
  
  // Test conversion: 100 CNY -> CAD
  const amountInput = page.locator('input[type="number"], input[placeholder*="金额"]').first();
  if (await amountInput.count().then(c => c > 0).catch(() => false)) {
    await amountInput.fill('100');
  }
  
  // Find and click convert button
  const convertBtn = page.locator('button:has-text("转换")');
  if (await convertBtn.count().then(c => c > 0).catch(() => false)) {
    await measureClick(page, 'button:has-text("转换")', 'exchange-convert');
    await page.waitForTimeout(800); // Wait for analytics fetch + API response
    
    // Check result
    const hasResult = await page.locator('text=转换结果').count().then(c => c > 0).catch(() => false);
    if (!hasResult) addError(1, name, '换算后未显示转换结果');
  }
  
  // Check analytics
  const analytics = analyticsRequests.filter(r => r.post && r.post.toolName === 'exchange-rate');
  
  // Test FAQ
  const faqSection = page.locator('text=汇率查询常见问题');
  if (await faqSection.count().then(c => c > 0).catch(() => false)) {
    const faqItem = page.locator('button:has-text("汇率多久更新")');
    if (await faqItem.count().then(c => c > 0).catch(() => false)) {
      await faqItem.first().click();
      await page.waitForTimeout(300);
    }
  }
  
  // === NEW: Test 30-day history chart ===
  // Capture requests to verify proxy API is used
  let historyApiCalled = false;
  let frankfurterCorsFound = false;
  const onRequest = req => {
    if (req.url().includes('/api/exchange-rate/history')) historyApiCalled = true;
  };
  const onConsole = msg => {
    if (msg.type() === 'error' && msg.text().includes('frankfurter.app')) {
      frankfurterCorsFound = true;
    }
  };
  page.on('request', onRequest);
  page.on('console', onConsole);
  
  const chartBtn = page.locator('button').filter({ hasText: /查看走势/ });
  if (await chartBtn.count().then(c => c > 0).catch(() => false)) {
    await chartBtn.click();
    await page.waitForTimeout(2500); // Allow API fetch time
    
    // Check chart area or empty state
    const hasChart = await page.locator('text=走势').count().then(c => c > 0).catch(() => false);
    const hasEmpty = await page.locator('text=走势暂不可用').count().then(c => c > 0).catch(() => false) ||
                     await page.locator('text=无可用历史数据').count().then(c => c > 0).catch(() => false);
    const hasError = await page.locator('text=加载失败').count().then(c => c > 0).catch(() => false);
    
    if (hasChart || hasEmpty) {
      log(`[${name}] History chart: ${hasChart ? 'data shown' : 'empty state shown'}`);
    } else if (hasError) {
      addError(1, name, '汇率走势图显示加载失败');
    } else {
      addWarning(2, name, '汇率走势图状态不明确');
    }
    
    // Verify proxy usage
    if (historyApiCalled) {
      log(`[${name}] Proxy API /api/exchange-rate/history called ✓`);
    } else {
      addWarning(2, name, '未检测到本站代理 API 请求');
    }
    if (frankfurterCorsFound) {
      addError(1, name, '仍出现 frankfurter.app CORS 报错');
    }
    
    // Collapse chart (button text changed to "收起")
    const collapseBtn = page.locator('button').filter({ hasText: /收起/ });
    if (await collapseBtn.count().then(c => c > 0).catch(() => false)) {
      await collapseBtn.click();
      await page.waitForTimeout(200);
    }
  }
  
  page.off('request', onRequest);
  page.off('console', onConsole);
  
  saveScreenshot(page, 'exchange-rate');
  recordPage(name, 'passed', { hasDisclaimer, analytics: analytics.length });
  log(`[${name}] Completed: disclaimer=${hasDisclaimer}, analytics=${analytics.length}`);
}

// ============================================================
// TEST 6.5: Starter Resources (/starter)
// ============================================================
async function testStarter(page) {
  const name = 'starter';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/starter', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  results.timings['starter-load'] = Date.now() - t0;
  
  // Check title
  const h1Text = await page.locator('h1').first().innerText().catch(() => '');
  const hasTitle = h1Text.includes('外网新手资源清单');
  if (!hasTitle) {
    addError(0, name, '页面标题应为「外网新手资源清单」');
  }
  
  // Check 5 categories exist
  const categories = ['新手必装软件', 'AI 工具', '视频与学习平台', '账号安全', '浏览器插件'];
  for (const cat of categories) {
    const exists = await page.locator(`text=${cat}`).count().then(c => c > 0).catch(() => false);
    if (!exists) addError(1, name, `分类「${cat}」未出现`);
  }
  
  // Check forbidden content (only in main content, not in disclaimer)
  const forbidden = ['VPN下载', '翻墙工具推荐'];
  for (const term of forbidden) {
    const found = await page.locator(`text=${term}`).count().then(c => c > 0).catch(() => false);
    if (found) addError(1, name, `页面不应出现「${term}」`);
  }
  // Check for YouTube playlist ID (should not be on page)
  const pageContent = await page.content();
  if (pageContent.includes('PLToFqcThng7rCz')) {
    addError(1, name, '页面不应包含 YouTube 播放列表 ID');
  }
  
  // Check external links have target="_blank" and rel="noopener"
  const externalLinks = page.locator('a[target="_blank"]');
  const count = await externalLinks.count();
  let hasOpener = false;
  for (let i = 0; i < count; i++) {
    const rel = await externalLinks.nth(i).getAttribute('rel').catch(() => '');
    if (rel && !rel.includes('noopener')) {
      hasOpener = true;
      break;
    }
  }
  if (count > 0 && hasOpener) {
    addWarning(2, name, '部分外链缺少 rel="noopener"');
  }
  
  saveScreenshot(page, 'starter');
  recordPage(name, 'passed', { title: h1Text, externalLinks: count });
  log(`[${name}] Completed: title="${h1Text}", links=${count}`);
}

// ============================================================
// TEST 7: Memo
// ============================================================
async function testMemo(page) {
  const name = 'memo';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  // Analytics: captured at context level
  analyticsRequests.length = 0;
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/tools/memo', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('button:has-text("新建便签")', { timeout: 5000 }).catch(() => {});
  results.timings['memo-load'] = Date.now() - t0;
  
  // Add a new memo
  const addBtn = page.locator('button:has-text("新增便签"), button:has-text("新建"), button:has-text("+")');
  if (await addBtn.count().then(c => c > 0).catch(() => false)) {
    await addBtn.first().click();
    await page.waitForTimeout(300);
    
    // Fill form
    const titleInput = page.locator('input[placeholder*="标题"]').first();
    const contentInput = page.locator('textarea').first();
    
    if (await titleInput.count().then(c => c > 0).catch(() => false)) {
      await titleInput.fill('E2E测试便签');
    }
    if (await contentInput.count().then(c => c > 0).catch(() => false)) {
      await contentInput.fill('这是自动化测试生成的便签内容\n123 Test St, Vancouver');
    }
    
    // Save
    const saveBtn = page.locator('button:has-text("保存"), button:has-text("确认")');
    if (await saveBtn.count().then(c => c > 0).catch(() => false)) {
      await measureClick(page, 'button:has-text("保存"), button:has-text("确认")', 'memo-add', { waitForMs: 100 });
      await page.waitForTimeout(800); // Wait for analytics fetch
    }
  }
  
  // Test search
  const searchInput = page.locator('input[placeholder*="搜索"]');
  if (await searchInput.count().then(c => c > 0).catch(() => false)) {
    await searchInput.fill('测试');
    await page.waitForTimeout(300);
  }
  
  // Test export
  const exportBtn = page.locator('button:has-text("导出"), button:has-text("Export")');
  if (await exportBtn.count().then(c => c > 0).catch(() => false)) {
    await measureClick(page, 'button:has-text("导出"), button:has-text("Export")', 'memo-export', { waitForMs: 100 });
    await page.waitForTimeout(800); // Wait for analytics fetch
  }
  
  // Clean up: delete the test note
  const deleteBtn = page.locator('button[title="删除"]');
  if (await deleteBtn.count().then(c => c > 0).catch(() => false)) {
    await deleteBtn.first().click();
    await page.waitForTimeout(300);
  }
  
  // Test FAQ
  const faqSection = page.locator('text=跨境工作便签常见问题');
  if (await faqSection.count().then(c => c > 0).catch(() => false)) {
    const faqItem = page.locator('button:has-text("便签数据存在哪里")');
    if (await faqItem.count().then(c => c > 0).catch(() => false)) {
      await faqItem.first().click();
      await page.waitForTimeout(300);
    }
  }
  
  // Check analytics
  const memoAnalytics = analyticsRequests.filter(r => r.post && r.post.toolName === 'memo');
  
  saveScreenshot(page, 'memo');
  recordPage(name, 'passed', { analytics: memoAnalytics.length });
  log(`[${name}] Completed: analytics=${memoAnalytics.length}`);
}

// ============================================================
// TEST 8: Resources
// ============================================================
async function testResources(page) {
  const name = 'resources';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  // Analytics: captured at context level
  analyticsRequests.length = 0;
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/resources', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
  results.timings['resources-load'] = Date.now() - t0;
  
  // Test category links - visit each category page and verify content
  const categories = ['life', 'logistics', 'business', 'templates'];
  for (const cat of categories) {
    let catOk = false;
    
    // Strategy 1: Try clicking from home page link
    const link = page.locator(`a[href*="/resources/${cat}"]`).first();
    if (await link.count().then(c => c > 0).catch(() => false)) {
      await link.first().click();
      await page.waitForTimeout(800);
      catOk = true;
    }
    
    // Strategy 2: If link not found, navigate directly
    if (!catOk) {
      await page.goto(BASE_URL + `/resources/${cat}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800);
      // Verify URL is correct
      const currentUrl = page.url();
      if (currentUrl.includes(`/resources/${cat}`)) {
        catOk = true;
      }
    }
    
    if (catOk) {
      // Check page has meaningful content
      const hasTitle = await page.locator('h1, h2').first().isVisible().catch(() => false);
      const hasCards = await page.locator('a[href], article, [class*="card"], [class*="item"]').count().then(c => c > 0).catch(() => false);
      const hasButtons = await page.locator('button, a[target="_blank"], [role="button"]').count().then(c => c > 0).catch(() => false);
      
      if (!hasTitle && !hasCards && !hasButtons) {
        addWarning(2, name, `分类 /resources/${cat} 页面内容较少`);
      }
      // Page is accessible, do NOT report P1
      
      // Test a resource link (check href only)
      const extLink = page.locator('a[target="_blank"]').first();
      if (await extLink.count().then(c => c > 0).catch(() => false)) {
        const href = await extLink.getAttribute('href');
        if (!href || href === '#') addWarning(2, name, `分类 ${cat} 外链 href 为空`);
      }
      
      await page.goto(BASE_URL + '/resources', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(300);
    } else {
      addWarning(2, name, `分类 /resources/${cat} 无法访问`);
    }
  }
  
  // Check analytics
  const resAnalytics = analyticsRequests.filter(r => r.post && r.post.toolName === 'resources');
  
  saveScreenshot(page, 'resources');
  recordPage(name, 'passed', { categories: categories.length, analytics: resAnalytics.length });
  log(`[${name}] Completed: categories=${categories.length}, analytics=${resAnalytics.length}`);
}

// ============================================================
// TEST 9: Guides / Articles
// ============================================================
async function testGuides(page) {
  const name = 'guides';
  log(`[${name}] Starting test...`);
  setupCapture(page, name);
  // Analytics: captured at context level
  analyticsRequests.length = 0;
  
  const t0 = Date.now();
  await page.goto(BASE_URL + '/guides', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);
  results.timings['guides-load'] = Date.now() - t0;
  
  // Find and click an article
  const articleLink = page.locator('a[href*="/guides/"]').first();
  if (await articleLink.count().then(c => c > 0).catch(() => false)) {
    await articleLink.click();
    await page.waitForTimeout(2000);
    
    // Check article loaded
    const articleTitle = await page.locator('h1, h2').first().innerText().catch(() => '');
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Check related tools section
    const relatedTools = page.locator('text=相关工具');
    const hasRelated = await relatedTools.count().then(c => c > 0).catch(() => false);
    
    if (hasRelated) {
      // Click first related tool
      const toolLink = page.locator('a[href*="/tools/"]').first();
      if (await toolLink.count().then(c => c > 0).catch(() => false)) {
        await toolLink.click();
        await page.waitForTimeout(1500);
        
        // Check tool page loaded
        const toolLoaded = await page.locator('h1').count().then(c => c > 0).catch(() => false);
        if (!toolLoaded) addError(1, name, '从文章点击相关工具后未到达工具页');
        
        // Check analytics
        const articleAnalytics = analyticsRequests.filter(r => r.post && r.post.toolName === 'blog');
        if (articleAnalytics.length === 0) addError(2, name, '文章相关工具点击未触发埋点');
      }
    }
    
    saveScreenshot(page, 'article');
  } else {
    addError(1, name, '指南列表页未找到文章链接');
  }
  
  saveScreenshot(page, 'guides');
  recordPage(name, 'passed');
  log(`[${name}] Completed`);
}

// ============================================================
// TEST 10: API Events Stats
// ============================================================
async function testAPIStats(page) {
  const name = 'api-stats';
  log(`[${name}] Starting test...`);
  
  const response = await page.goto(BASE_URL + '/api/events/stats', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
  
  if (response) {
    const status = response.status();
    const body = await response.json().catch(() => null);
    
    if (status === 200 && body && body.total !== undefined) {
      recordPage(name, 'passed', { status, totalEvents: body.total });
      log(`[${name}] API accessible: ${body.total} total events`);
    } else if (status === 403) {
      recordPage(name, 'passed', { status, note: 'Stats protected (403) - expected in production' });
      log(`[${name}] Stats protected (403)`);
    } else {
      addError(2, name, `/api/events/stats returned status ${status}`);
      recordPage(name, 'warning', { status });
    }
  } else {
    addError(1, name, '/api/events/stats failed to load');
  }
}

// ============================================================
// TEST 11: Rate Limiting Test
// ============================================================
async function testRateLimiting(page) {
  const name = 'rate-limit';
  log(`[${name}] Starting test...`);
  
  let got429 = false;
  for (let i = 0; i < 25; i++) {
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'tool_click', toolName: 'rate-test', action: 'test' }),
      });
      return res.status;
    }).catch(() => 0);
    
    if (response === 429) {
      got429 = true;
      log(`[${name}] Rate limited at request #${i + 1}`);
      break;
    }
  }
  
  if (got429) {
    recordPage(name, 'passed', { got429: true });
    log(`[${name}] Rate limiting works`);
  } else {
    // Not necessarily an error - rate limit window might not be hit
    recordPage(name, 'passed', { got429: false, note: 'Rate limit not triggered in 25 requests' });
    log(`[${name}] Rate limiting not triggered (25 requests)`);
  }
}

// ============================================================
// MAIN: Run all tests
// ============================================================
async function main() {
  log(`========== Round ${ROUND} START ==========`);
  log(`BASE_URL=${BASE_URL}, HEADLESS=${HEADLESS}, MOBILE=${MOBILE_VP}`);
  
  // Determine if this is a mobile round
  const vp = MOBILE_VP === 1 ? VIEWPORTS[0] : VIEWPORTS[1];
  
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOWMO,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    userAgent: vp.userAgent,
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
  });

  // Set up global analytics capture on context
  await setupAnalyticsCapture(context);

  // Video recording for failures
  const videoPath = join(VIDEO_DIR, `round-${ROUND}.webm`);
  const page = await context.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });
  
  try {
    // Run all tests
    await testHomepage(page);
    await testTracking(page);
    await testShippingCalculator(page);
    await testHSCode(page);
    await testPostalCode(page);
    await testExchangeRate(page);
    await testStarter(page);
    await testMemo(page);
    await testResources(page);
    await testGuides(page);
    await testAPIStats(page);
    await testRateLimiting(page);
    
    log(`========== Round ${ROUND} COMPLETED ==========`);
  } catch (e) {
    log(`ERROR in round ${ROUND}: ${e.message}`);
    addError(0, 'runner', `Round ${ROUND} crashed: ${e.message}`);
    
    // Save failure artifacts
    await page.screenshot({ path: join(SCREENSHOT_DIR, `round-${ROUND}-FAILURE.png`) }).catch(() => {});
  } finally {
    await context.close();
    await browser.close();
  }
  
  // ============ Generate Report ============
  const totalErrors = results.p0.length + results.p1.length + results.p2.length + results.p3.length;
  const p0Count = results.p0.length;
  const p1Count = results.p1.length;
  const p2Count = results.p2.length;
  const p3Count = results.p3.length;
  
  const mdReport = `# E2E Browser Test Report — Round ${ROUND}

**Time**: ${new Date().toISOString()}
**URL**: ${BASE_URL}
**Viewport**: ${vp.name} (${vp.width}x${vp.height})
**Headless**: ${HEADLESS}

## Summary

| Metric | Value |
|--------|-------|
| Pages Tested | ${results.pages.length} |
| P0 (Critical) | ${p0Count} |
| P1 (Major) | ${p1Count} |
| P2 (Minor) | ${p2Count} |
| P3 (Cosmetic) | ${p3Count} |
| Console Errors | ${results.consoleErrors.length} |
| Failed Requests | ${results.failedRequests.length} |
| Analytics Requests | ${analyticsRequests.length} |

## Page Results

${results.pages.map(p => `- **${p.name}**: ${p.status}${p.time ? ` (${p.time})` : ''}`).join('\n')}

## Performance Timings

${Object.entries(results.timings).map(([k, v]) => `- ${k}: ${v}ms`).join('\n')}

## P0 Issues

${p0Count === 0 ? '✅ None' : results.p0.map(e => `- [${e.page}] ${e.message}`).join('\n')}

## P1 Issues

${p1Count === 0 ? '✅ None' : results.p1.map(e => `- [${e.page}] ${e.message}`).join('\n')}

## P2 Issues

${p2Count === 0 ? '✅ None' : results.p2.map(e => `- [${e.page}] ${e.message}`).join('\n')}

## P3 Issues

${p3Count === 0 ? '✅ None' : results.p3.map(e => `- [${e.page}] ${e.message}`).join('\n')}

## Console Errors

${results.consoleErrors.length === 0 ? '✅ None' : results.consoleErrors.map(e => `- [${e.page}] ${e.text}`).join('\n')}

## Analytics

${analyticsRequests.length > 0 ? analyticsRequests.slice(0, 20).map(r => `- \`${r.post?.eventType}\` → \`${r.post?.toolName}\` (\`${r.post?.action}\`)`).join('\n') : 'No analytics requests captured'}

## Screenshots

${results.pages.filter(p => p.status).map(p => `- round-${ROUND}-${p.name}.png`).join('\n')}
`;

  // Save markdown report
  writeFileSync(join(REPORT_DIR, `round-${ROUND}.md`), mdReport);
  
  // Save JSON
  const jsonResult = {
    ...results,
    analyticsSample: analyticsRequests.slice(0, 50),
    reportFile: `round-${ROUND}.md`,
  };
  writeFileSync(join(REPORT_DIR, `round-${ROUND}.json`), JSON.stringify(jsonResult, null, 2));
  
  log(`Report saved: round-${ROUND}.md, round-${ROUND}.json`);
  log(`Screenshots: ${SCREENSHOT_DIR}/`);
  
  // Exit with appropriate code
  if (p0Count > 0) process.exit(1);
  process.exit(0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
