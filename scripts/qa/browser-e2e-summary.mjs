#!/usr/bin/env node
// browser-e2e-summary.mjs — 汇总所有轮次的测试结果
// 用法: node scripts/qa/browser-e2e-summary.mjs [date]

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const DATE_ARG = process.argv[2] || new Date().toISOString().slice(0, 10);
const REPORT_DIR = join(ROOT, 'reports', 'browser-qa', DATE_ARG);
const OUTPUT_FILE = join(REPORT_DIR, 'final-summary.md');

if (!existsSync(REPORT_DIR)) {
  console.error(`Report directory not found: ${REPORT_DIR}`);
  process.exit(1);
}

// Find all round JSON files
const files = readdirSync(REPORT_DIR).filter(f => f.startsWith('round-') && f.endsWith('.json'));
const rounds = [];

for (const file of files) {
  try {
    const data = JSON.parse(readFileSync(join(REPORT_DIR, file), 'utf-8'));
    rounds.push(data);
  } catch (e) {
    console.error(`Failed to parse ${file}: ${e.message}`);
  }
}

if (rounds.length === 0) {
  console.error('No round data found');
  process.exit(1);
}

// Sort by round number
rounds.sort((a, b) => a.round - b.round);

// ============ Aggregate Statistics ============
const totalRounds = rounds.length;
const firstTimestamp = rounds[0]?.timestamp || 'unknown';
const lastTimestamp = rounds[rounds.length - 1]?.timestamp || 'unknown';

let p0Count = 0, p1Count = 0, p2Count = 0, p3Count = 0;
let totalConsoleErrors = 0;
let totalFailedRequests = 0;
let totalAnalytics = 0;
const allPages = [];
const allTimings = {};
const allErrors = [];
const mobileIssues = [];
const analyticsBlockedOps = [];

for (const round of rounds) {
  p0Count += (round.p0 || []).length;
  p1Count += (round.p1 || []).length;
  p2Count += (round.p2 || []).length;
  p3Count += (round.p3 || []).length;
  totalConsoleErrors += (round.consoleErrors || []).length;
  totalFailedRequests += (round.failedRequests || []).length;
  totalAnalytics += (round.analyticsSample || []).length;
  allPages.push(...(round.pages || []));
  allErrors.push(...(round.p0 || []), ...(round.p1 || []), ...(round.p2 || []), ...(round.p3 || []));
  
  // Aggregate timings
  for (const [key, value] of Object.entries(round.timings || {})) {
    if (!allTimings[key]) allTimings[key] = [];
    allTimings[key].push(value);
  }
}

// ============ Compute averages ============
const avgTimings = {};
for (const [key, values] of Object.entries(allTimings)) {
  const sum = values.reduce((a, b) => a + b, 0);
  avgTimings[key] = {
    avg: Math.round(sum / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

// ============ Slowest pages ============
const pageTimings = [];
for (const [key, stats] of Object.entries(avgTimings)) {
  pageTimings.push({ key, avg: stats.avg, min: stats.min, max: stats.max });
}
pageTimings.sort((a, b) => b.avg - a.avg);

// ============ Page pass/fail ============
const pageStatus = {};
for (const page of allPages) {
  if (!pageStatus[page.name]) {
    pageStatus[page.name] = { pass: 0, fail: 0 };
  }
  if (page.status === 'passed') pageStatus[page.name].pass++;
  else pageStatus[page.name].fail++;
}

// ============ Generate Report ============
const mobileLabel = rounds[0]?.mobileViewport || 'Unknown';

let md = `# Browser E2E Final Summary

**Date**: ${DATE_ARG}
**Viewport**: ${mobileLabel}
**Total Rounds**: ${totalRounds}
**Time Range**: ${firstTimestamp} → ${lastTimestamp}

## Issue Summary

| Severity | Count | Description |
|----------|-------|-------------|
| P0 | ${p0Count} | Critical: page crash, build fail, data leak, API 500 |
| P1 | ${p1Count} | Major: slow response, broken flow, mobile unusable |
| P2 | ${p2Count} | Minor: unclear copy, weak errors, crowded UI |
| P3 | ${p3Count} | Cosmetic: style details, icon inconsistency |
| **Total** | **${p0Count + p1Count + p2Count + p3Count}** | |

## Page Status

| Page | Pass | Fail |
|------|------|------|
${Object.entries(pageStatus).map(([name, s]) => `| ${name} | ${s.pass} | ${s.fail} |`).join('\n')}

## Performance: Slowest Pages/Operations (Average)

| Operation | Avg (ms) | Min (ms) | Max (ms) | Samples |
|-----------|----------|----------|----------|---------|
${pageTimings.slice(0, 10).map(t => `| ${t.key} | ${t.avg} | ${t.min} | ${t.max} | ${avgTimings[t.key].count} |`).join('\n')}

## Console Errors

**Total**: ${totalConsoleErrors}

${totalConsoleErrors === 0 ? '✅ None' : 'Check individual round reports for details.'}

## Failed Requests

**Total**: ${totalFailedRequests}

${totalFailedRequests === 0 ? '✅ None' : 'Check individual round reports for details.'}

## Analytics

**Total requests captured**: ${totalAnalytics}

${totalAnalytics > 0 ? `✅ Analytics system is sending events.` : '⚠️ No analytics events captured.'}

## Business Flow Verification

| Flow | Status |
|------|--------|
| 首页 → 工具 | ${allPages.find(p => p.name === 'home')?.status || 'unknown'} |
| 物流追踪完整闭环 | ${allPages.find(p => p.name === 'tracking')?.status || 'unknown'} |
| 运费计算 | ${allPages.find(p => p.name === 'shipping-calculator')?.status || 'unknown'} |
| HS编码搜索 | ${allPages.find(p => p.name === 'hs-code')?.status || 'unknown'} |
| 邮编校验 | ${allPages.find(p => p.name === 'postal-code')?.status || 'unknown'} |
| 汇率换算 | ${allPages.find(p => p.name === 'exchange-rate')?.status || 'unknown'} |
| 便签 CRUD | ${allPages.find(p => p.name === 'memo')?.status || 'unknown'} |
| 资源库浏览 | ${allPages.find(p => p.name === 'resources')?.status || 'unknown'} |
| 指南 → 工具 | ${allPages.find(p => p.name === 'guides')?.status || 'unknown'} |

## Mobile Issues

${mobileIssues.length === 0 ? '✅ No mobile-specific issues detected.' : mobileIssues.map(i => `- ${i}`).join('\n')}

## Analytics Impact on Performance

${totalAnalytics > 0 ? `Analytics sent ${totalAnalytics} requests across ${totalRounds} rounds. Check if any operations were delayed.` : 'No analytics data to evaluate.'}

## Immediate Fixes Required

${p0Count + p1Count === 0 ? '✅ No immediate fixes required.' : 
(allErrors.filter(e => e.severity <= 1).map(e => `- [P${e.severity}] **${e.page}**: ${e.message}`).join('\n') || '✅ None')}

## Deferred Optimizations

${p2Count + p3Count === 0 ? '✅ No deferred optimizations needed.' :
(allErrors.filter(e => e.severity >= 2).map(e => `- [P${e.severity}] **${e.page}**: ${e.message}`).join('\n') || '✅ None')}

## Recommendation: Public Beta

${p0Count === 0 && p1Count <= 2 ? `**✅ 有条件是** — P0=0, P1=${p1Count}. 可以开始小范围公开试用，但需监控 P1 问题。` :
  p0Count === 0 ? `**⚠️ 有条件是** — P0=0, P1=${p1Count}. 建议先修复 P1 问题再公开。` :
  `**❌ 否** — P0=${p0Count}. 存在严重问题，不建议公开。`}

## Round Details

| Round | Status | Pages | P0 | P1 | P2 | P3 | Analytics |
|-------|--------|-------|----|----|----|----|-----------|
${rounds.map(r => `| ${r.round} | ${r.pages?.filter(p => p.status === 'passed').length || 0}/${r.pages?.length || 0} | ${r.pages?.length || 0} | ${r.p0?.length || 0} | ${r.p1?.length || 0} | ${r.p2?.length || 0} | ${r.p3?.length || 0} | ${(r.analyticsSample || []).length} |`).join('\n')}

## Files

- Round reports: \`reports/browser-qa/${DATE_ARG}/round-XX.md\`
- Round data: \`reports/browser-qa/${DATE_ARG}/round-XX.json\`
- Screenshots: \`reports/browser-qa/${DATE_ARG}/screenshots/\`
- Videos: \`reports/browser-qa/${DATE_ARG}/videos/\`
- Traces: \`reports/browser-qa/${DATE_ARG}/traces/\`
- Logs: \`reports/browser-qa/${DATE_ARG}/browser-overnight.log\`

---
*Generated: ${new Date().toISOString()}*
`;

writeFileSync(OUTPUT_FILE, md);
console.log(`\nFinal summary written to: ${OUTPUT_FILE}`);
console.log(`Rounds: ${totalRounds}, P0: ${p0Count}, P1: ${p1Count}, P2: ${p2Count}, P3: ${p3Count}`);
