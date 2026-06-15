#!/usr/bin/env node

/**
 * v1.20.42.6.86.3 TW Official 3-digit Postal Code Import Script
 * 
 * 用途：导入台湾官方 3 码邮编数据到生产 postal_codes 表
 * 数据来源：中华邮政官方 XLS + XML 经纬度数据
 * 模式：默认 dry-run（不写入数据库）
 * 
 * 使用方法：
 *   node scripts/import-postal-tw-official-3digit.mjs                    # dry-run
 *   node scripts/import-postal-tw-official-3digit.mjs --verbose          # dry-run + 详细输出
 *   node scripts/import-postal-tw-official-3digit.mjs --execute          # 真实导入（需用户批准）
 * 
 * 用户批准语句（必须）：
 *   "批准导入中国台湾 TW 官方 3 码邮编数据到生产 postal_codes 表，并接受其作为部分覆盖数据展示。"
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const DATA_FILE = join(PROJECT_ROOT, 'data/postal-import-samples/tw-3digit-merged.json');

// 解析命令行参数
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const executeMode = args.includes('--execute');

console.log('='.repeat(80));
console.log('v1.20.42.6.86.3 TW Official 3-digit Postal Code Import');
console.log('='.repeat(80));
console.log(`模式: ${executeMode ? '⚠️  EXECUTE (真实导入)' : '✅ DRY-RUN (仅验证)'}`);
console.log(`数据文件: ${DATA_FILE}`);
console.log(`详细模式: ${verbose ? '是' : '否'}`);
console.log('='.repeat(80));
console.log();

// 检查文件是否存在
if (!existsSync(DATA_FILE)) {
  console.error(`❌ 数据文件不存在: ${DATA_FILE}`);
  console.error('   请先运行解析脚本生成数据文件');
  process.exit(1);
}

// 读取数据
const rawData = readFileSync(DATA_FILE, 'utf-8');
const records = JSON.parse(rawData);

console.log(`✅ 成功加载数据: ${records.length} 条记录`);
console.log();

// 统计结构
const stats = {
  inputRows: records.length,
  validRows: 0,
  invalidRows: 0,
  skippedDuplicates: 0,
  plannedInserts: 0,
  
  missingPostalCode: 0,
  missingCity: 0,
  missingDistrict: 0,
  
  withLatLng: 0,
  withoutLatLng: 0,
  
  uniqueKeys: new Set(),
  sampleRecords: [],
  
  cityStats: {},
  
  issues: []
};

// 字段验证和清洗
console.log('📍 开始字段验证和清洗...');
console.log('-'.repeat(80));

for (let i = 0; i < records.length; i++) {
  const record = records[i];
  
  // 字段清洗
  const cleaned = {
    countryCode: record.countryCode || 'TW',
    postalCode: String(record.postalCode || '').trim(),
    city: String(record.city || '').trim(),
    province: String(record.province || record.city || '').trim(),
    district: String(record.district || '').trim(),
    country: record.country || '中国台湾',
    countryEn: record.countryEn || 'Taiwan, China',
    latitude: record.latitude || null,
    longitude: record.longitude || null,
    source: record.source || 'Chunghwa Post Official 3-digit',
    sourceFile: record.sourceFile || 'tw-3digit-official.xls',
    importBatch: record.importBatch || 'batch-a-tw-official-3digit-20260615'
  };
  
  // 验证必填字段
  let isValid = true;
  
  if (!cleaned.postalCode || cleaned.postalCode === '') {
    stats.missingPostalCode++;
    isValid = false;
    stats.issues.push(`Row ${i + 1}: 缺少 postalCode`);
  }
  
  if (!cleaned.city || cleaned.city === '') {
    stats.missingCity++;
    isValid = false;
    stats.issues.push(`Row ${i + 1}: 缺少 city`);
  }
  
  if (!cleaned.district || cleaned.district === '') {
    stats.missingDistrict++;
    isValid = false;
    stats.issues.push(`Row ${i + 1}: 缺少 district`);
  }
  
  // 统计经纬度
  if (cleaned.latitude && cleaned.longitude) {
    stats.withLatLng++;
  } else {
    stats.withoutLatLng++;
  }
  
  // 生成唯一键（用于去重）
  const uniqueKey = `${cleaned.countryCode}|${cleaned.postalCode}|${cleaned.city}|${cleaned.district}`;
  
  if (stats.uniqueKeys.has(uniqueKey)) {
    stats.skippedDuplicates++;
    if (verbose) {
      stats.issues.push(`Row ${i + 1}: 重复记录 (${uniqueKey})`);
    }
    continue;
  }
  
  stats.uniqueKeys.add(uniqueKey);
  
  if (isValid) {
    stats.validRows++;
    stats.plannedInserts++;
    
    // 统计城市
    if (!stats.cityStats[cleaned.city]) {
      stats.cityStats[cleaned.city] = 0;
    }
    stats.cityStats[cleaned.city]++;
    
    // 记录样本（前 20 条）
    if (stats.sampleRecords.length < 20) {
      stats.sampleRecords.push(cleaned);
    }
  } else {
    stats.invalidRows++;
  }
}

// 输出统计信息
console.log();
console.log('📊 导入统计:');
console.log('-'.repeat(80));
console.log(`输入行数: ${stats.inputRows}`);
console.log(`有效行数: ${stats.validRows}`);
console.log(`无效行数: ${stats.invalidRows}`);
console.log(`跳过重复: ${stats.skippedDuplicates}`);
console.log(`计划插入: ${stats.plannedInserts}`);
console.log();
console.log(`缺少 postalCode: ${stats.missingPostalCode}`);
console.log(`缺少 city: ${stats.missingCity}`);
console.log(`缺少 district: ${stats.missingDistrict}`);
console.log();
console.log(`有经纬度: ${stats.withLatLng} (${(stats.withLatLng/stats.inputRows*100).toFixed(1)}%)`);
console.log(`无经纬度: ${stats.withoutLatLng} (${(stats.withoutLatLng/stats.inputRows*100).toFixed(1)}%)`);
console.log();

// 输出城市统计
console.log('📍 城市统计:');
console.log('-'.repeat(80));
const sortedCities = Object.entries(stats.cityStats).sort((a, b) => b[1] - a[1]);
for (const [city, count] of sortedCities) {
  console.log(`  ${city}: ${count} 个区域`);
}
console.log();

// 输出样本记录
console.log('📋 样本记录 (前 20 条):');
console.log('-'.repeat(80));
for (const record of stats.sampleRecords) {
  const latlng = record.latitude && record.longitude 
    ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
    : 'N/A';
  console.log(`${record.country} | ${record.postalCode} | ${record.city} | ${record.district} | ${latlng}`);
}
console.log();

// 输出问题列表
if (stats.issues.length > 0) {
  console.log('⚠️  发现的问题:');
  console.log('-'.repeat(80));
  for (const issue of stats.issues.slice(0, 20)) {
    console.log(`  ${issue}`);
  }
  if (stats.issues.length > 20) {
    console.log(`  ... 还有 ${stats.issues.length - 20} 个问题`);
  }
  console.log();
}

// 导入执行（如果 --execute）
if (executeMode) {
  console.log('='.repeat(80));
  console.log('⚠️  即将执行真实导入...');
  console.log('='.repeat(80));
  console.log();
  console.log('❌ 本轮禁止使用 --execute 模式');
  console.log('   请等待用户明确批准后再执行');
  console.log();
  console.log('用户批准语句（必须）：');
  console.log('  "批准导入中国台湾 TW 官方 3 码邮编数据到生产 postal_codes 表，');
  console.log('   并接受其作为部分覆盖数据展示。"');
  console.log();
  process.exit(1);
}

// 生成 Import Manifest
console.log('='.repeat(80));
console.log('📄 Import Manifest');
console.log('='.repeat(80));
console.log();

const manifest = {
  version: 'v1.20.42.6.86.3',
  batchId: 'batch-a-tw-official-3digit-20260615',
  timestamp: new Date().toISOString(),
  mode: executeMode ? 'EXECUTE' : 'DRY-RUN',
  source: {
    name: '中华邮政官方',
    primaryFile: 'tw-3digit-official.xls',
    primaryUrl: 'https://www.post.gov.tw/post/download/103.12.25-臺灣地區郵遞區號前3碼一覽表.xls',
    secondaryFile: 'tw-3digit-latlng.xml',
    secondaryUrl: 'https://www.post.gov.tw/post/download/1050812_行政區經緯度(toPost).xml',
    license: '政府資料開放授權條款-第1版',
    provider: '中华邮政股份有限公司'
  },
  dataQuality: {
    inputRows: stats.inputRows,
    validRows: stats.validRows,
    invalidRows: stats.invalidRows,
    skippedDuplicates: stats.skippedDuplicates,
    plannedInserts: stats.plannedInserts,
    withLatLng: stats.withLatLng,
    withoutLatLng: stats.withoutLatLng
  },
  fieldMapping: {
    countryCode: 'TW (硬编码)',
    postalCode: '3 码前缀',
    city: '县市',
    province: '县市 (同 city)',
    district: '区/乡/镇/市',
    latitude: '中心点纬度 (20.2% 覆盖)',
    longitude: '中心点经度 (20.2% 覆盖)',
    country: '中国台湾 (硬编码)',
    countryEn: 'Taiwan, China (硬编码)',
    source: 'Chunghwa Post Official 3-digit (硬编码)'
  },
  coverageLevel: '区级 (3 码前缀)',
  schemaCompatible: true,
  requiresMigration: false,
  attribution: {
    required: true,
    text: [
      '资料来源：中华邮政股份有限公司《臺灣地區郵遞區號前3碼一覽表》。',
      '本开放资料依政府資料開放授權條款第 1 版提供。',
      '查询结果仅供参考，正式投递前请以中华邮政官方资料为准。'
    ],
    textEn: [
      'Source: Chunghwa Post Co., Ltd., Taiwan 3-digit postal code table.',
      'Released under the Open Government Data License, version 1.',
      'Results are for reference only.'
    ]
  },
  frontendDisplay: {
    coverageStatus: '🟡 部分覆盖',
    coverageText: '基础区级邮编覆盖',
    disclaimer: '当前提供区级 3 码邮递区号参考，详细投递前请以官方邮政资料为准。'
  },
  rollbackSQL: `DELETE FROM postal_codes WHERE "countryCode" = 'TW' AND source = 'Chunghwa Post Official 3-digit';`,
  userApprovalRequired: '批准导入中国台湾 TW 官方 3 码邮编数据到生产 postal_codes 表，并接受其作为部分覆盖数据展示。',
  recommendation: '可以导入，但需注意：只有 3 码前缀（区级），不是完整 3+3 码（街道级）',
  issues: stats.issues.slice(0, 50)
};

console.log(JSON.stringify(manifest, null, 2));
console.log();

console.log('='.repeat(80));
console.log('✅ Dry-run 完成');
console.log('='.repeat(80));
console.log();
console.log('📌 重要提示:');
console.log('   - 本轮未写入任何数据库记录');
console.log('   - 数据来源：中华邮政官方 XLS + XML');
console.log('   - 数据完整度：只有 3 码前缀（区级），不是完整 3+3 码（街道级）');
console.log('   - 经纬度覆盖率：20.2%（67/331）');
console.log('   - 如需真实导入，需要用户明确批准');
console.log();
console.log('用户批准语句（必须）：');
console.log('  "批准导入中国台湾 TW 官方 3 码邮编数据到生产 postal_codes 表，');
console.log('   并接受其作为部分覆盖数据展示。"');
console.log();
