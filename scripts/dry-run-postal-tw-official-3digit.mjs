#!/usr/bin/env node

/**
 * v1.20.42.6.86.2 TW Official Postal Code Dry-run & Field Validation
 * 
 * 用途：验证台湾官方 3 码邮编数据的字段清洗和导入可行性
 * 数据来源：中华邮政官方 XLS 文件（臺灣地區郵遞區號前3碼一覽表.xls）
 * 模式：默认 dry-run（不写入数据库）
 * 
 * 使用方法：
 *   node scripts/dry-run-postal-tw-official-3digit.mjs
 *   node scripts/dry-run-postal-tw-official-3digit.mjs --verbose
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const DATA_FILE = join(PROJECT_ROOT, 'data/postal-import-samples/tw-3digit-parsed.json');

// 解析命令行参数
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const executeMode = args.includes('--execute');

if (executeMode) {
  console.error('❌ 错误：本轮禁止使用 --execute 模式');
  console.error('   只能使用 dry-run 模式进行验证');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('v1.20.42.6.86.2 TW Official Postal Code Dry-run & Field Validation');
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
  totalRecords: records.length,
  validRecords: 0,
  invalidRecords: 0,
  duplicateRecords: 0,
  
  missingPostalCode: 0,
  missingCity: 0,
  missingDistrict: 0,
  
  postalCodeFormat: {
    '3-digit': 0,
    '5-digit': 0,
    '6-digit': 0,
    'other': 0
  },
  
  uniqueKeys: new Set(),
  sampleRecords: [],
  
  cityStats: {},
  
  issues: []
};

// 字段清洗和验证
console.log('📍 开始字段清洗和验证...');
console.log('-'.repeat(80));

for (let i = 0; i < records.length; i++) {
  const record = records[i];
  
  // 字段清洗
  const cleaned = {
    countryCode: 'TW',
    postalCode: String(record.postalCode || '').trim(),
    city: String(record.city || '').trim(),
    province: String(record.city || '').trim(), // 台湾县市即省份
    district: String(record.district || '').trim(),
    country: '中国台湾',
    countryEn: 'Taiwan, China',
    source: '中华邮政官方',
    sourceFile: 'tw-3digit-official.xls',
    importBatch: 'batch-a-tw-official-3digit-20260615'
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
  
  // 验证邮编格式
  const postalCodeLen = cleaned.postalCode.length;
  if (postalCodeLen === 3) {
    stats.postalCodeFormat['3-digit']++;
  } else if (postalCodeLen === 5) {
    stats.postalCodeFormat['5-digit']++;
  } else if (postalCodeLen === 6) {
    stats.postalCodeFormat['6-digit']++;
  } else {
    stats.postalCodeFormat['other']++;
    stats.issues.push(`Row ${i + 1}: 邮编格式异常 (${cleaned.postalCode})`);
  }
  
  // 生成唯一键（用于去重）
  const uniqueKey = `${cleaned.countryCode}|${cleaned.postalCode}|${cleaned.city}|${cleaned.district}`;
  
  if (stats.uniqueKeys.has(uniqueKey)) {
    stats.duplicateRecords++;
    if (verbose) {
      stats.issues.push(`Row ${i + 1}: 重复记录 (${uniqueKey})`);
    }
    continue;
  }
  
  stats.uniqueKeys.add(uniqueKey);
  
  if (isValid) {
    stats.validRecords++;
    
    // 统计城市
    if (!stats.cityStats[cleaned.city]) {
      stats.cityStats[cleaned.city] = 0;
    }
    stats.cityStats[cleaned.city]++;
    
    // 记录样本（前 10 条）
    if (stats.sampleRecords.length < 10) {
      stats.sampleRecords.push(cleaned);
    }
  } else {
    stats.invalidRecords++;
  }
}

// 输出统计信息
console.log();
console.log('📊 验证统计:');
console.log('-'.repeat(80));
console.log(`总记录数: ${stats.totalRecords}`);
console.log(`有效记录数: ${stats.validRecords}`);
console.log(`无效记录数: ${stats.invalidRecords}`);
console.log(`重复记录数: ${stats.duplicateRecords}`);
console.log();
console.log(`缺少 postalCode: ${stats.missingPostalCode}`);
console.log(`缺少 city: ${stats.missingCity}`);
console.log(`缺少 district: ${stats.missingDistrict}`);
console.log();
console.log('邮编格式分布:');
console.log(`  3 码: ${stats.postalCodeFormat['3-digit']}`);
console.log(`  5 码: ${stats.postalCodeFormat['5-digit']}`);
console.log(`  6 码: ${stats.postalCodeFormat['6-digit']}`);
console.log(`  其他: ${stats.postalCodeFormat['other']}`);
console.log();
console.log(`唯一键数: ${stats.uniqueKeys.size}`);
console.log(`预计插入数: ${stats.uniqueKeys.size}`);
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
console.log('📋 样本记录 (前 10 条):');
console.log('-'.repeat(80));
for (const record of stats.sampleRecords) {
  console.log(`${record.country} | ${record.postalCode} | ${record.city} | ${record.district}`);
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

// 生成 Import Manifest
console.log('='.repeat(80));
console.log('📄 Import Manifest');
console.log('='.repeat(80));
console.log();

const manifest = {
  version: 'v1.20.42.6.86.2',
  batchId: 'batch-a-tw-official-3digit-20260615',
  timestamp: new Date().toISOString(),
  mode: executeMode ? 'EXECUTE' : 'DRY-RUN',
  source: {
    name: '中华邮政官方',
    file: 'tw-3digit-official.xls',
    url: 'https://www.post.gov.tw/post/download/103.12.25-臺灣地區郵遞區號前3碼一覽表.xls',
    license: '政府資料開放授權條款-第1版',
    provider: '中华邮政股份有限公司'
  },
  dataQuality: {
    totalRecords: stats.totalRecords,
    validRecords: stats.validRecords,
    invalidRecords: stats.invalidRecords,
    duplicateRecords: stats.duplicateRecords,
    uniqueKeys: stats.uniqueKeys.size,
    estimatedInserts: stats.uniqueKeys.size
  },
  fieldMapping: {
    countryCode: 'TW (硬编码)',
    postalCode: '3 码前缀',
    city: '县市',
    province: '县市 (同 city)',
    district: '区/乡/镇/市',
    country: '中国台湾 (硬编码)',
    countryEn: 'Taiwan, China (硬编码)',
    source: '中华邮政官方 (硬编码)'
  },
  postalCodeFormat: stats.postalCodeFormat,
  coverageLevel: '区级 (3 码前缀)',
  schemaCompatible: true,
  requiresMigration: false,
  attribution: {
    required: true,
    text: [
      '中华邮政股份有限公司 [2015] [臺灣地區郵遞區號前3碼一覽表]',
      '此開放資料依政府資料開放授權條款 (Open Government Data License) 進行公眾釋出',
      'https://data.gov.tw/license'
    ]
  },
  recommendation: '可以导入，但需注意：只有 3 码前缀（区级），不是完整 3+3 码（街道级）',
  frontendDisplay: {
    coverageStatus: '🟡 部分覆盖',
    coverageText: '基础区级邮编覆盖',
    disclaimer: '当前提供区级邮递区号参考，详细投递前请以官方邮政资料为准。'
  },
  issues: stats.issues.slice(0, 50),
  nextSteps: [
    '用户确认是否接受只有 3 码前缀的数据',
    '用户确认是否标注显名声明（Attribution）',
    '用户确认前端显示口径',
    '用户批准后执行导入'
  ]
};

console.log(JSON.stringify(manifest, null, 2));
console.log();

console.log('='.repeat(80));
console.log('✅ Dry-run 完成');
console.log('='.repeat(80));
console.log();
console.log('📌 重要提示:');
console.log('   - 本轮未写入任何数据库记录');
console.log('   - 数据来源：中华邮政官方 XLS 文件');
console.log('   - 数据完整度：只有 3 码前缀（区级），不是完整 3+3 码（街道级）');
console.log('   - 如需真实导入，需要用户明确批准');
console.log();
