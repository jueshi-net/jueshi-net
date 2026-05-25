/**
 * pSEO Destinations Seeder
 * 
 * Injects 21+ core country destination pages into the DB.
 * Uses upsert to ensure idempotency (safe to re-run).
 * 
 * Usage:
 *   npx tsx scripts/seed-pseo-destinations.ts
 *   
 *   Local: uses DATABASE_URL from .env (Neon)
 *   VPS:   NODE_ENV=production npx tsx scripts/seed-pseo-destinations.ts
 *          (uses DATABASE_URL from .env.production via prisma.config.ts)
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

// ── Environment-aware env loading (mirrors prisma.config.ts) ─────────────────
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env';

// Dynamic dotenv import
const dotenvPath = path.resolve(process.cwd(), envFile);
import('dotenv').then(({ default: dotenv }) => {
  dotenv.config({ path: dotenvPath });
  console.log(`[pSEO Seeder] NODE_ENV=${nodeEnv}, Loaded: ${envFile}`);
  runSeeder();
}).catch(() => {
  console.log(`[pSEO Seeder] dotenv not available, using process.env.DATABASE_URL`);
  runSeeder();
});

function runSeeder() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('postgresql')) {
    console.error('[pSEO Seeder] ERROR: DATABASE_URL not set or invalid:', dbUrl);
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  const SEED_FILE = path.resolve(process.cwd(), 'prisma/seeds/destinations-batch.json');

  interface SeedGuide {
    title: string;
    description: string;
    type: 'guide' | 'regulation' | 'tax' | 'logistics' | 'customs';
  }

  interface SeedDestination {
    slug: string;
    name: string;
    nameEn: string;
    emoji: string;
    region: string;
    currency: string;
    heroTitle: string;
    heroSubtitle: string;
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
    keyCities: string[];
    userCount?: string;
    docCount?: string;
    isActive?: boolean;
    tools?: string[];
    guides?: SeedGuide[];
  }

  const DEFAULT_TOOLS = [
    'postal-code',
    'shipping-calculator',
    'hs-code',
    'commercial-invoice',
    'quote-sheet',
    'exchange-rate',
    'tracking',
    'address-formatter',
  ];

  async function main() {
    console.log('[pSEO Seeder] Reading seed data from:', SEED_FILE);
    
    if (!fs.existsSync(SEED_FILE)) {
      console.error('[pSEO Seeder] ERROR: Seed file not found:', SEED_FILE);
      await prisma.$disconnect();
      process.exit(1);
    }

    const raw: SeedDestination[] = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
    console.log(`[pSEO Seeder] Loaded ${raw.length} destinations from seed file`);

    // ── Add missing countries to reach 21+ ────────────────────────────────────
    const existingSlugs = new Set(raw.map(d => d.slug));
    
    if (!existingSlugs.has('canada')) {
      raw.push({
        slug: 'canada',
        name: '加拿大',
        nameEn: 'Canada',
        emoji: '🇨🇦',
        region: '北美',
        currency: 'CAD',
        heroTitle: '加拿大出海全能工具箱',
        heroSubtitle: '覆盖加拿大CBSA清关、GST/HST税务、跨境物流全链路，助您高效拓展北美市场。',
        seoTitle: '加拿大出海工具箱 - 海关清关、GST税务、跨境电商一站式服务',
        seoDescription: '为出海加拿大的跨境电商和外贸企业提供全套工具与指南，涵盖加拿大CBSA海关清关流程、GST/HST税率（5%-15%）、物流时效（美加专线7-12天）、CETA原产地证等关键信息，助力企业合规高效运营。',
        keywords: ['加拿大出海', '加拿大海关', '加拿大GST', '加拿大HST', '加拿大物流', '加拿大清关', '北美电商', '加拿大跨境电商', 'CETA原产地证', '加拿大进口'],
        keyCities: ['多伦多', '温哥华', '蒙特利尔', '卡尔加里', '渥太华'],
        userCount: '5,800+',
        docCount: '25,000+',
        guides: [
          { title: '加拿大CBSA海关清关流程指南', description: '详解加拿大进口清关步骤：商业发票、B3报关单、CARS账户注册。GST税率5%（部分省份叠加PST/HST），货值低于20加元可免税。', type: 'customs' },
          { title: '加拿大GST/HST注册与申报指南', description: '年收入超过3万加元必须注册GST/HST。指南涵盖注册流程、申报周期（季度/年度）、进项税抵扣规则及各省税率差异（5%-15%）。', type: 'tax' },
          { title: '中国至加拿大物流运输时效指南', description: '中国至加拿大海运15-25天，空运5-7天；末端派送由Canada Post或Purolator完成。建议选温哥华/多伦多海外仓降低配送成本。', type: 'logistics' },
        ],
      });
    }

    if (!existingSlugs.has('malaysia')) {
      raw.push({
        slug: 'malaysia',
        name: '马来西亚',
        nameEn: 'Malaysia',
        emoji: '🇲🇾',
        region: '东南亚',
        currency: 'MYR',
        heroTitle: '马来西亚出海全能工具箱',
        heroSubtitle: '覆盖马来西亚海关、SST税务、东南亚物流全链路，助您高效拓展东盟市场。',
        seoTitle: '马来西亚出海工具箱 - 海关清关、SST税务、跨境电商一站式服务',
        seoDescription: '为出海马来西亚的跨境电商和外贸企业提供全套工具与指南，涵盖马来西亚海关清关流程、SST销售税税率（5%-10%）、物流时效（3-7天）、Form E原产地证等关键信息。',
        keywords: ['马来西亚出海', '马来西亚海关', '马来西亚SST', '马来西亚物流', '马来西亚清关', '东南亚电商', '马来西亚跨境电商', '东盟贸易', 'Form E', '马来西亚进口'],
        keyCities: ['吉隆坡', '槟城', '新山', '古晋', '亚庇'],
        userCount: '4,200+',
        docCount: '18,000+',
        guides: [
          { title: '马来西亚海关清关流程指南', description: '详解马来西亚进口清关步骤：K1报关单、MAQIS许可、SIRIM认证。SST税率5%-10%，货值低于500马币可免税。', type: 'customs' },
          { title: '马来西亚SST注册与申报指南', description: '年营业额超过50万马元必须注册SST。指南涵盖注册流程、申报周期、抵扣规则及服务税与销售税区分。', type: 'tax' },
          { title: '中国至马来西亚物流时效指南', description: '中国至马来西亚海运5-8天，空运2-3天；末端派送由Pos Malaysia或J&T完成。建议选双清包税渠道降低风险。', type: 'logistics' },
        ],
      });
    }

    console.log(`[pSEO Seeder] Total destinations to process: ${raw.length}`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const dest of raw) {
      try {
        const existing = await prisma.destination.findUnique({
          where: { slug: dest.slug },
          include: { tools: true, guides: true },
        });

        if (existing) {
          await prisma.destination.update({
            where: { slug: dest.slug },
            data: {
              name: dest.name,
              nameEn: dest.nameEn,
              currency: dest.currency,
              region: dest.region,
              emoji: dest.emoji,
              heroTitle: dest.heroTitle,
              heroSubtitle: dest.heroSubtitle,
              seoTitle: dest.seoTitle,
              seoDescription: dest.seoDescription,
              keywords: dest.keywords,
              keyCities: dest.keyCities,
              userCount: dest.userCount || '0',
              docCount: dest.docCount || '0',
              isActive: dest.isActive !== false,
            },
          });
          updated++;
          console.log(`  ✏️  Updated: ${dest.slug} (${dest.name})`);
        } else {
          await prisma.destination.create({
            data: {
              slug: dest.slug,
              name: dest.name,
              nameEn: dest.nameEn,
              currency: dest.currency,
              region: dest.region,
              emoji: dest.emoji,
              heroTitle: dest.heroTitle,
              heroSubtitle: dest.heroSubtitle,
              seoTitle: dest.seoTitle,
              seoDescription: dest.seoDescription,
              keywords: dest.keywords,
              keyCities: dest.keyCities,
              userCount: dest.userCount || '0',
              docCount: dest.docCount || '0',
              isActive: dest.isActive !== false,
              tools: {
                create: DEFAULT_TOOLS.map((toolSlug, idx) => ({
                  toolSlug,
                  sortOrder: idx,
                })),
              },
              guides: {
                create: (dest.guides || []).map((g, idx) => ({
                  title: g.title,
                  description: g.description,
                  type: g.type,
                  sortOrder: idx,
                })),
              },
            },
          });
          created++;
          console.log(`  ✅ Created: ${dest.slug} (${dest.name})`);
        }
      } catch (err: any) {
        console.error(`  ❌ Failed: ${dest.slug} - ${err.message}`);
        skipped++;
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`[pSEO Seeder] Done! Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
    console.log('═══════════════════════════════════════');

    const total = await prisma.destination.count();
    console.log(`[pSEO Seeder] Total destinations in DB: ${total}`);

    await prisma.$disconnect();
  }

  main().catch((err) => {
    console.error('[pSEO Seeder] Fatal error:', err.message);
    process.exit(1);
  });
}
