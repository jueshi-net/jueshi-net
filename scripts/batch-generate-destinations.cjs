#!/usr/bin/env node
/**
 * Batch generate destination data using DeepSeek API.
 * Reads AI config from .env, generates JSON for each country, writes to prisma/seeds/destinations-batch.json
 */

const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const [key, ...rest] = line.split('=');
  envVars[key.trim()] = rest.join('=').trim();
});

const AI_API_BASE_URL = envVars.AI_API_BASE_URL || process.env.AI_API_BASE_URL || 'https://api.deepseek.com/v1';
const AI_API_KEY = envVars.AI_API_KEY || process.env.AI_API_KEY;
const AI_MODEL = envVars.AI_MODEL || process.env.AI_MODEL || 'deepseek-chat';

if (!AI_API_KEY) {
  console.error('❌ AI_API_KEY not found in .env or environment');
  process.exit(1);
}

// Country config
const COUNTRIES = [
  { name: '新加坡', nameEn: 'Singapore', slug: 'singapore', emoji: '🇸🇬', region: '东南亚', currency: 'SGD' },
  { name: '英国', nameEn: 'United Kingdom', slug: 'uk', emoji: '🇬🇧', region: '欧洲', currency: 'GBP' },
  { name: '德国', nameEn: 'Germany', slug: 'germany', emoji: '🇩🇪', region: '欧洲', currency: 'EUR' },
  { name: '法国', nameEn: 'France', slug: 'france', emoji: '🇫🇷', region: '欧洲', currency: 'EUR' },
  { name: '美国', nameEn: 'United States', slug: 'usa', emoji: '🇺🇸', region: '北美', currency: 'USD' },
  { name: '澳大利亚', nameEn: 'Australia', slug: 'australia', emoji: '🇦🇺', region: '澳洲', currency: 'AUD' },
  { name: '新西兰', nameEn: 'New Zealand', slug: 'new-zealand', emoji: '🇳🇿', region: '澳洲', currency: 'NZD' },
  { name: '日本', nameEn: 'Japan', slug: 'japan', emoji: '🇯🇵', region: '日韩', currency: 'JPY' },
  { name: '韩国', nameEn: 'South Korea', slug: 'south-korea', emoji: '🇰🇷', region: '日韩', currency: 'KRW' },
  { name: '泰国', nameEn: 'Thailand', slug: 'thailand', emoji: '🇹🇭', region: '东南亚', currency: 'THB' },
  { name: '越南', nameEn: 'Vietnam', slug: 'vietnam', emoji: '🇻🇳', region: '东南亚', currency: 'VND' },
  { name: '印度尼西亚', nameEn: 'Indonesia', slug: 'indonesia', emoji: '🇮🇩', region: '东南亚', currency: 'IDR' },
  { name: '菲律宾', nameEn: 'Philippines', slug: 'philippines', emoji: '🇵🇭', region: '东南亚', currency: 'PHP' },
  { name: '阿联酋', nameEn: 'UAE', slug: 'uae', emoji: '🇦🇪', region: '中东', currency: 'AED' },
  { name: '沙特阿拉伯', nameEn: 'Saudi Arabia', slug: 'saudi-arabia', emoji: '🇸🇦', region: '中东', currency: 'SAR' },
  { name: '巴西', nameEn: 'Brazil', slug: 'brazil', emoji: '🇧🇷', region: '拉美', currency: 'BRL' },
  { name: '墨西哥', nameEn: 'Mexico', slug: 'mexico', emoji: '🇲🇽', region: '北美', currency: 'MXN' },
  { name: '西班牙', nameEn: 'Spain', slug: 'spain', emoji: '🇪🇸', region: '欧洲', currency: 'EUR' },
  { name: '意大利', nameEn: 'Italy', slug: 'italy', emoji: '🇮🇹', region: '欧洲', currency: 'EUR' },
];

const SYSTEM_PROMPT = `你是一个跨境出海数据专家。请为指定国家生成完整的 CMS 数据，返回严格的 JSON 格式（不要任何 markdown 代码块包裹，只返回纯 JSON）。

必须包含以下字段：
- slug: 英文短横线格式（如 "united-kingdom"）
- name: 中文名称
- nameEn: 英文名称
- emoji: 国旗 emoji
- region: 所属区域（北美/欧洲/东南亚/日韩/拉美/中东/澳洲）
- currency: 货币代码
- heroTitle: Hero 区标题，如 "{国家}出海全能工具箱"
- heroSubtitle: Hero 区副标题，描述该平台能提供的核心服务
- seoTitle: SEO 标题
- seoDescription: SEO 描述（100-160字）
- keywords: 7-10个 SEO 关键词数组
- keyCities: 3-5个热门城市数组
- userCount: 商家数量（如 "8,500+"）
- docCount: 单据数量（如 "32,000+"）
- guides: 5条百科指南数组，每条包含 {title, description, type}，type 为 guide/logistics/tax/customs 之一
- services: 4条服务商数组，每条包含 {title, category, description}，category 为 仓储/物流/报关/税务/合规/代购 之一
- tools: 工具 slug 数组，从以下候选中挑选 5-7 个与该国家最相关的：
  ["commercial-invoice","packing-list","sales-contract","proforma-invoice","booking-instruction","customs-declaration-authorization","delivery-note","freight-statement","consolidation-inbound-receipt","consolidation-packing-list","express-declaration","quotation","shipping-instruction","trucking-dispatch-order","shipping-mark","container-loading-list","return-packing-list","certificate-of-origin-template","fumigation-certificate-template","letter-of-credit-info-sheet","label-maker","postal-code","shipping-calculator","exchange-rate"]

要求：
1. 所有内容必须针对该国家的实际情况，不能泛泛而谈
2. 指南和服务商的描述要具体，包含真实的海关政策、税务门槛、物流时效等数据
3. 关键词要贴合该国家出海场景
4. 只返回纯 JSON，不要任何额外文字`;

async function generateCountry(country) {
  const prompt = `请为以下国家生成完整的出海目的地 CMS 数据：

中文名：${country.name}
英文名：${country.nameEn}
Slug：${country.slug}
Emoji：${country.emoji}
区域：${country.region}
货币：${country.currency}`;

  const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices[0].message.content;

  // Parse JSON — strip markdown code blocks if present
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(jsonStr);
}

async function main() {
  console.log(`🚀 Starting batch generation for ${COUNTRIES.length} countries...`);
  console.log(`📡 API: ${AI_API_BASE_URL} | Model: ${AI_MODEL}`);
  console.log('');

  const results = [];
  const errors = [];
  const batchSize = 3; // concurrency limit
  const delayMs = 2000; // delay between batches

  for (let i = 0; i < COUNTRIES.length; i += batchSize) {
    const batch = COUNTRIES.slice(i, i + batchSize);
    console.log(`⏳ Generating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(COUNTRIES.length / batchSize)}: ${batch.map(c => c.name).join(', ')}`);

    const promises = batch.map(async (country) => {
      try {
        const start = Date.now();
        const data = await generateCountry(country);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        // Merge with base config
        const merged = {
          slug: data.slug || country.slug,
          name: data.name || country.name,
          nameEn: data.nameEn || country.nameEn,
          emoji: data.emoji || country.emoji,
          region: data.region || country.region,
          currency: data.currency || country.currency,
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          keywords: data.keywords || [],
          keyCities: data.keyCities || [],
          userCount: data.userCount || '0',
          docCount: data.docCount || '0',
          isActive: true,
          guides: data.guides || [],
          services: data.services || [],
          tools: data.tools || [],
        };

        results.push(merged);
        console.log(`  ✅ ${country.emoji} ${country.name} (${elapsed}s) — ${merged.guides.length} guides, ${merged.services.length} services, ${merged.tools.length} tools`);
      } catch (err) {
        errors.push({ country: country.name, error: err.message });
        console.log(`  ❌ ${country.emoji} ${country.name}: ${err.message}`);
      }
    });

    await Promise.all(promises);

    if (i + batchSize < COUNTRIES.length) {
      console.log(`  ⏱️ Waiting ${delayMs}ms before next batch...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  // Write output
  const outputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'destinations-batch.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`📊 Generation Complete`);
  console.log(`   ✅ Success: ${results.length}/${COUNTRIES.length}`);
  console.log(`   ❌ Failed: ${errors.length}`);
  console.log(`   📁 Output: ${outputPath}`);
  if (errors.length > 0) {
    console.log('   Errors:', errors.map(e => `${e.country}: ${e.error}`).join('; '));
  }
  console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
