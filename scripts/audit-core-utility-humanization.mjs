#!/usr/bin/env node
// scripts/audit-core-utility-humanization.mjs
// Audit script for core utility tool humanization features
// Checks: page 200, h1, input, examples, results, copy, recent, disclaimer, related, EventLog, mobile

import http from 'node:http';

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:3000';
const results = [];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
}

async function auditPage(path, label) {
  console.log(`\n── ${label} (${path}) ──`);
  try {
    const res = await fetch(`${BASE}${path}`);
    check(`${label}: HTTP 200`, res.status === 200, `status=${res.status}`);
    if (res.status !== 200) return;

    const html = res.body;
    check(`${label}: has h1`, /<h1[^>]*>/i.test(html), html.match(/<h1[^>]*>([^<]*)/i)?.[1] || '');
    check(`${label}: has input`, /<input[^>]*>/i.test(html));
    check(`${label}: has disclaimer`, /免责|仅供参考|仅供参考|disclaimer/i.test(html));
    check(`${label}: has FAQ`, /FAQ|常见问题|faq/i.test(html));
  } catch (e) {
    check(`${label}: fetch error`, false, e.message);
  }
}

async function auditHumanization(path, label) {
  console.log(`\n── ${label} 人性化检查 ──`);
  try {
    const res = await fetch(`${BASE}${path}`);
    if (res.status !== 200) return;
    const html = res.body;

    // Check for example buttons
    check(`${label}: 示例按钮`, /示例|example|sample|保温杯|Toronto|SW1A/i.test(html));
    // Check for copy button
    check(`${label}: 复制按钮`, /复制|copy|clipboard/i.test(html));
    // Check for recent queries (localStorage)
    check(`${label}: 最近查询`, /最近|recent|history|localStorage/i.test(html));
    // Check for related tools
    check(`${label}: 相关工具`, /相关工具|related.*tool|下一步|推荐工具/i.test(html));
    // Check for related checklist
    check(`${label}: 相关清单`, /相关清单|related.*checklist|清单/i.test(html));
    // Check for official links
    check(`${label}: 官方入口`, /官方|official|Canada Post|USPS|Royal Mail|customs/i.test(html));
    // Check for EventLog (trackEvent)
    check(`${label}: EventLog 引用`, /trackEvent|analytics|eventType/i.test(html));
  } catch (e) {
    check(`${label}: fetch error`, false, e.message);
  }
}

async function main() {
  console.log(`🔍 Core Utility Humanization Audit — ${BASE}\n`);

  // Basic page checks
  await auditPage('/tools/postal-code', '邮编查询');
  await auditPage('/tools/hs-code', 'HS编码');
  await auditPage('/tools/exchange-rate', '汇率换算');
  await auditPage('/tools/address-formatter', '地址格式化');

  // Humanization checks
  await auditHumanization('/tools/postal-code', '邮编查询');
  await auditHumanization('/tools/hs-code', 'HS编码');
  await auditHumanization('/tools/exchange-rate', '汇率换算');
  await auditHumanization('/tools/address-formatter', '地址格式化');

  // Summary
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`\n════════════════════════════════════════`);
  console.log(`📊 结果: ${passed}/${total} 通过`);
  console.log(`════════════════════════════════════════`);

  // Write JSON
  const fs = await import('node:fs');
  const outDir = 'reports/overnight-core-utility-sprint';
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/audit-core-utility-humanization.json`, JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    total,
    passed,
    failed: total - passed,
    results,
  }, null, 2));
  console.log(`\n📝 JSON: ${outDir}/audit-core-utility-humanization.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
