#!/usr/bin/env node
/**
 * scripts/audit-brand-copy.mjs
 * 审计全站品牌命名使用情况
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');

const BRAND_TERMS = [
  '海外百宝箱',
  '绝世工具箱',
  '绝世好 BOX',
  '绝世好BOX',
  '绝世百宝箱',
  '数字百宝箱',
  'jueshi.net',
];

const results = [];
let filesScanned = 0;

function scanDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    if (entry.isDirectory()) { scanDir(fullPath); continue; }
    if (!/\.(tsx?|jsx?|md|mdx|json|yaml|yml)$/.test(entry.name)) continue;
    filesScanned++;
    try {
      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        for (const term of BRAND_TERMS) {
          if (lines[i].includes(term)) {
            results.push({
              file: relative(ROOT, fullPath),
              line: i + 1,
              term,
              text: lines[i].trim().slice(0, 120),
            });
          }
        }
      }
    } catch { /* skip unreadable */ }
  }
}

scanDir(SRC_DIR);

// Group by term
const byTerm = {};
for (const r of results) {
  if (!byTerm[r.term]) byTerm[r.term] = [];
  byTerm[r.term].push(r);
}

const jsonOutput = {
  timestamp: new Date().toISOString(),
  filesScanned,
  totalHits: results.length,
  summary: Object.fromEntries(
    Object.entries(byTerm).map(([term, hits]) => [term, hits.length])
  ),
  details: results,
};

console.log(JSON.stringify(jsonOutput, null, 2));

// Write report
import { writeFileSync } from 'fs';
const reportDir = join(ROOT, 'reports/brand-polish');
writeFileSync(join(reportDir, 'brand-copy-audit.json'), JSON.stringify(jsonOutput, null, 2));

let md = `# 品牌命名审计报告\n\n`;
md += `**扫描时间：** ${jsonOutput.timestamp}\n`;
md += `**扫描文件数：** ${filesScanned}\n`;
md += `**命中总数：** ${jsonOutput.totalHits}\n\n`;

md += `## 按术语统计\n\n`;
md += `| 术语 | 出现次数 |\n|---|---|\n`;
for (const [term, count] of Object.entries(jsonOutput.summary)) {
  md += `| ${term} | ${count} |\n`;
}

md += `\n## 详细命中\n\n`;
for (const [term, hits] of Object.entries(byTerm)) {
  md += `### "${term}" (${hits.length} 处)\n\n`;
  for (const h of hits.slice(0, 10)) {
    md += `- \`${h.file}:${h.line}\`\n  \`${h.text}\`\n`;
  }
  if (hits.length > 10) md += `\n... 还有 ${hits.length - 10} 处\n`;
  md += `\n`;
}

writeFileSync(join(reportDir, 'brand-copy-audit.md'), md);
console.log(`\n报告已写入 reports/brand-polish/`);
