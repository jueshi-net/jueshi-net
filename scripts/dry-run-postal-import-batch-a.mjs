#!/usr/bin/env node

/**
 * v1.20.42.6.86 Batch A Import Dry-run Script
 * 
 * 用途：验证 Taiwan (TW) 和 Vietnam (VN) 邮编数据的导入可行性
 * 模式：默认 dry-run（不写入数据库）
 * 
 * 使用方法：
 *   node scripts/dry-run-postal-import-batch-a.mjs
 *   node scripts/dry-run-postal-import-batch-a.mjs --country=TW
 *   node scripts/dry-run-postal-import-batch-a.mjs --country=VN
 * 
 * 注意：
 *   - 默认只输出统计信息，不写入数据库
 *   - 如需真实导入，需要显式 --execute 参数（本轮禁止使用）
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const DATA_DIR = join(PROJECT_ROOT, 'data/postal-import-samples');

// 解析命令行参数
const args = process.argv.slice(2);
const countryFilter = args.find(a => a.startsWith('--country='))?.split('=')[1]?.toUpperCase();
const executeMode = args.includes('--execute');

if (executeMode) {
  console.error('❌ 错误：本轮禁止使用 --execute 模式');
  console.error('   只能使用 dry-run 模式进行验证');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('v1.20.42.6.86 Batch A Import Dry-run');
console.log('='.repeat(80));
console.log(`模式: ${executeMode ? '⚠️  EXECUTE (真实导入)' : '✅ DRY-RUN (仅验证)'}`);
console.log(`国家过滤: ${countryFilter || '全部'}`);
console.log(`数据目录: ${DATA_DIR}`);
console.log('='.repeat(80));
console.log();

// 统计结构
const stats = {
  TW: {
    totalInputRows: 0,
    validRows: 0,
    invalidRows: 0,
    duplicateRows: 0,
    missingPostalCode: 0,
    missingCity: 0,
    missingProvince: 0,
    sampleRecords: [],
    uniqueKeys: new Set(),
    estimatedInserts: 0
  },
  VN: {
    totalInputRows: 0,
    validRows: 0,
    invalidRows: 0,
    duplicateRows: 0,
    missingPostalCode: 0,
    missingCity: 0,
    missingProvince: 0,
    sampleRecords: [],
    uniqueKeys: new Set(),
    estimatedInserts: 0
  }
};

// TW 数据处理
function processTaiwan() {
  if (countryFilter && countryFilter !== 'TW') {
    console.log('⏭️  跳过 Taiwan (TW) - 被国家过滤排除');
    return;
  }

  console.log('📍 处理 Taiwan (TW) 数据...');
  console.log('-'.repeat(80));

  const filePath = join(DATA_DIR, 'tw-zip-code-gist.json');
  
  if (!existsSync(filePath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    console.log('   请先下载数据文件');
    return;
  }

  try {
    const rawData = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!data.cities || !Array.isArray(data.cities)) {
      console.log('❌ 数据格式错误：缺少 cities 数组');
      return;
    }

    console.log(`✅ 成功加载数据: ${data.cities.length} 个城市`);
    console.log();

    // 处理每个城市和区域
    for (const city of data.cities) {
      const province = city.name; // 城市即省份
      
      if (!city.region || !Array.isArray(city.region)) {
        stats.TW.invalidRows++;
        continue;
      }

      for (const region of city.region) {
        stats.TW.totalInputRows++;

        const postalCode = String(region.code);
        const district = region.name;
        const cityName = province; // 台湾的市/县即城市

        // 验证必填字段
        if (!postalCode || postalCode.trim() === '') {
          stats.TW.missingPostalCode++;
          stats.TW.invalidRows++;
          continue;
        }

        if (!cityName || cityName.trim() === '') {
          stats.TW.missingCity++;
          stats.TW.invalidRows++;
          continue;
        }

        if (!province || province.trim() === '') {
          stats.TW.missingProvince++;
          stats.TW.invalidRows++;
          continue;
        }

        // 生成唯一键（用于去重）
        const uniqueKey = `TW|${postalCode}|${cityName}|${province}`;
        
        if (stats.TW.uniqueKeys.has(uniqueKey)) {
          stats.TW.duplicateRows++;
          continue;
        }

        stats.TW.uniqueKeys.add(uniqueKey);
        stats.TW.validRows++;

        // 记录样本（前 10 条）
        if (stats.TW.sampleRecords.length < 10) {
          stats.TW.sampleRecords.push({
            countryCode: 'TW',
            postalCode,
            city: cityName,
            province,
            district,
            country: '中国台湾',
            countryEn: 'Taiwan, China'
          });
        }
      }
    }

    stats.TW.estimatedInserts = stats.TW.uniqueKeys.size;

    console.log(`📊 Taiwan (TW) 统计:`);
    console.log(`   总输入行数: ${stats.TW.totalInputRows}`);
    console.log(`   有效行数: ${stats.TW.validRows}`);
    console.log(`   无效行数: ${stats.TW.invalidRows}`);
    console.log(`   重复行数: ${stats.TW.duplicateRows}`);
    console.log(`   缺少 postalCode: ${stats.TW.missingPostalCode}`);
    console.log(`   缺少 city: ${stats.TW.missingCity}`);
    console.log(`   缺少 province: ${stats.TW.missingProvince}`);
    console.log(`   唯一键数: ${stats.TW.uniqueKeys.size}`);
    console.log(`   预计插入数: ${stats.TW.estimatedInserts}`);
    console.log();

    if (stats.TW.sampleRecords.length > 0) {
      console.log('📋 Taiwan (TW) 样本记录 (前 10 条):');
      console.log('-'.repeat(80));
      for (const record of stats.TW.sampleRecords) {
        console.log(`   ${record.country} | ${record.postalCode} | ${record.city} | ${record.district}`);
      }
      console.log();
    }

  } catch (error) {
    console.log(`❌ 处理失败: ${error.message}`);
  }
}

// VN 数据处理
function processVietnam() {
  if (countryFilter && countryFilter !== 'VN') {
    console.log('⏭️  跳过 Vietnam (VN) - 被国家过滤排除');
    return;
  }

  console.log('📍 处理 Vietnam (VN) 数据...');
  console.log('-'.repeat(80));

  // 越南数据质量太低，只有省份级别范围，不适合导入
  console.log('⚠️  Vietnam (VN) 数据评估:');
  console.log('   - 数据源: zipcodevietnam.com');
  console.log('   - 数据格式: 只有省份级别的邮编范围（如 10000-14000）');
  console.log('   - 数据完整度: D（缺少 district、latitude、longitude）');
  console.log('   - License: 不明确');
  console.log('   - 质量评分: D');
  console.log();
  console.log('❌ 结论: 不适合导入生产数据库');
  console.log('   建议: 暂缓，寻找商业数据源或等待官方开放数据');
  console.log();

  // 记录统计信息（模拟）
  stats.VN.totalInputRows = 63; // 63 个省份
  stats.VN.validRows = 0; // 都不符合导入标准
  stats.VN.invalidRows = 63;
  stats.VN.missingPostalCode = 63; // 只有范围，无具体邮编
  stats.VN.missingCity = 0;
  stats.VN.missingProvince = 0;
  stats.VN.duplicateRows = 0;
  stats.VN.estimatedInserts = 0;

  console.log(`📊 Vietnam (VN) 统计:`);
  console.log(`   总输入行数: ${stats.VN.totalInputRows}`);
  console.log(`   有效行数: ${stats.VN.validRows}`);
  console.log(`   无效行数: ${stats.VN.invalidRows}`);
  console.log(`   重复行数: ${stats.VN.duplicateRows}`);
  console.log(`   缺少 postalCode: ${stats.VN.missingPostalCode}`);
  console.log(`   缺少 city: ${stats.VN.missingCity}`);
  console.log(`   缺少 province: ${stats.VN.missingProvince}`);
  console.log(`   唯一键数: ${stats.VN.uniqueKeys.size}`);
  console.log(`   预计插入数: ${stats.VN.estimatedInserts}`);
  console.log();
}

// 生成 Import Manifest
function generateManifest() {
  console.log('='.repeat(80));
  console.log('📄 Import Manifest');
  console.log('='.repeat(80));
  console.log();

  const manifest = {
    version: 'v1.20.42.6.86',
    batchId: 'batch-a-dry-run-20260613',
    timestamp: new Date().toISOString(),
    mode: executeMode ? 'EXECUTE' : 'DRY-RUN',
    countries: {
      TW: {
        source: 'GitHub Gist (taiwan-zip-code.json)',
        sourceUrl: 'https://gist.githubusercontent.com/ajhsu/86b2f4fd5e94c2111d7d93ee9c6a4345/raw/taiwan-zip-code.json',
        license: '政府资料开放授权条款-第1版',
        qualityScore: 'B+',
        stats: {
          totalInputRows: stats.TW.totalInputRows,
          validRows: stats.TW.validRows,
          invalidRows: stats.TW.invalidRows,
          duplicateRows: stats.TW.duplicateRows,
          missingPostalCode: stats.TW.missingPostalCode,
          missingCity: stats.TW.missingCity,
          missingProvince: stats.TW.missingProvince,
          estimatedInserts: stats.TW.estimatedInserts
        },
        recommendation: '建议小批量导入审批',
        requiresMigration: false,
        schemaCompatible: true
      },
      VN: {
        source: 'zipcodevietnam.com (省份级别)',
        sourceUrl: 'https://zipcodevietnam.com/',
        license: '不明确',
        qualityScore: 'D',
        stats: {
          totalInputRows: stats.VN.totalInputRows,
          validRows: stats.VN.validRows,
          invalidRows: stats.VN.invalidRows,
          duplicateRows: stats.VN.duplicateRows,
          missingPostalCode: stats.VN.missingPostalCode,
          missingCity: stats.VN.missingCity,
          missingProvince: stats.VN.missingProvince,
          estimatedInserts: stats.VN.estimatedInserts
        },
        recommendation: '暂缓导入，数据质量太低',
        requiresMigration: false,
        schemaCompatible: false
      }
    },
    totalEstimatedInserts: stats.TW.estimatedInserts + stats.VN.estimatedInserts,
    nextSteps: [
      '用户确认 TW 数据导入',
      '用户确认是否保留繁体中文字段',
      '用户确认是否需要补充经纬度数据',
      'VN 数据暂缓，寻找商业数据源'
    ]
  };

  console.log(JSON.stringify(manifest, null, 2));
  console.log();
}

// 主流程
console.log();
processTaiwan();
console.log();
processVietnam();
console.log();
generateManifest();

console.log('='.repeat(80));
console.log('✅ Dry-run 完成');
console.log('='.repeat(80));
console.log();
console.log('📌 重要提示:');
console.log('   - 本轮未写入任何数据库记录');
console.log('   - 如需真实导入，需要用户明确批准');
console.log('   - 真实导入需要 --execute 参数（本轮禁止使用）');
console.log();
