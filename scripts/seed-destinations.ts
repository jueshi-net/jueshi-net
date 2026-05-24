/**
 * Seed destinations from static config into Prisma DB.
 * Run: npx tsx scripts/seed-destinations.ts
 * Safe to re-run: uses upsert for destinations + clears children first.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Inline config (copied from destinations-config.ts for standalone execution)
interface DestData {
  slug: string; name: string; nameEn: string; currency: string; region: string; emoji: string;
  heroTitle: string; heroSubtitle: string; seoTitle: string; seoDescription: string;
  keywords: string[]; keyCities: string[]; userCount: string; docCount: string;
  tools: string[];
  guides: { title: string; description: string; type: string }[];
  services: { title: string; category: string; description: string }[];
}

const destinations: DestData[] = [
  {
    slug: "canada", name: "加拿大", nameEn: "Canada", currency: "CAD", region: "北美", emoji: "🇨🇦",
    heroTitle: "加拿大出海全能工具箱", heroSubtitle: "商业单据生成 · 物流追踪 · 邮编查询 · 汇率换算 — 一站式搞定",
    seoTitle: "加拿大出海全能工具箱 — 商业单据·物流追踪·邮编查询",
    seoDescription: "面向加拿大出海商家的一站式工具平台：商业发票、装箱单、销售合同在线生成，17TRACK 物流追踪，邮编查询，汇率换算。支持 CAD 货币与加拿大主要城市。",
    keywords: ["加拿大出海", "加拿大物流", "加拿大邮编", "加拿大快递", "CAD 汇率", "加拿大报关", "加拿大商业发票"],
    keyCities: ["多伦多", "温哥华", "蒙特利尔", "卡尔加里", "渥太华"],
    userCount: "12,500+", docCount: "45,000+",
    tools: ["commercial-invoice", "packing-list", "postal-code", "shipping-calculator", "exchange-rate", "shipping-label"],
    guides: [
      { title: "个人行李免税申报指南", description: "新移民或留学生首次入境加拿大，如何通过 BSF186 表格申报个人行李享受免税。涵盖申报流程、表格填写要点、注意事项。", type: "customs" },
      { title: "加拿大 FBA 敏感货规则与合规要求", description: "Amazon 加拿大站 FBA 发货须知：哪些属于敏感货、液体/粉末/带电产品的申报方式、关税起征点（CAD 20 以下免征 GST）。", type: "logistics" },
      { title: "加拿大商业发票（Commercial Invoice）填写规范", description: "出口加拿大必备：发票必须包含 Harmonized System (HS) 编码、原产地声明、买卖双方完整信息。附模板与实例对照。", type: "guide" },
      { title: "加拿大 GST/HST 税务登记与申报入门", description: "在加拿大经营电商业务需要了解 GST/HST 注册门槛（年收入超过 CAD 30,000 必须注册）、申报频率、抵扣规则。", type: "tax" },
      { title: "中加跨境物流渠道对比：空运 vs 海运 vs 快递", description: "DHL/FedEx/UPS 直邮 vs 海运到温哥华/多伦多港 vs 空派专线，时效与费用对比，适合不同重量段的发货方案推荐。", type: "logistics" },
    ],
    services: [
      { title: "加拿大海外仓一件代发服务", category: "仓储", description: "温哥华、多伦多本地仓储，支持 Amazon FBA 中转、B2B/B2C 一件代发、退换货处理。" },
      { title: "加拿大报关行代理服务", category: "报关", description: "持有 CCAA 资质的报关行，代理进出口报关、关税评估、原产地证审核。" },
      { title: "加拿大跨境电商税务合规咨询", category: "税务", description: "GST/HST 注册、年度申报、跨境所得税筹划、CRA 审计应对。" },
      { title: "中加跨境专线物流服务", category: "物流", description: "中国 → 加拿大空运专线（7-10 天）、海运整柜/拼箱（25-35 天），包清关到门。" },
    ],
  },
  {
    slug: "malaysia", name: "马来西亚", nameEn: "Malaysia", currency: "MYR", region: "东南亚", emoji: "🇲🇾",
    heroTitle: "马来西亚出海全能工具箱", heroSubtitle: "商业单据生成 · 物流追踪 · 邮编查询 · 汇率换算 — 一站式搞定",
    seoTitle: "马来西亚出海全能工具箱 — 商业单据·物流追踪·邮编查询",
    seoDescription: "面向马来西亚出海商家的一站式工具平台：商业发票、装箱单、销售合同在线生成，国际物流追踪，邮编查询，汇率换算。支持 MYR 货币与马来西亚主要城市。",
    keywords: ["马来西亚出海", "马来西亚物流", "马来西亚邮编", "MYR 汇率", "马来西亚报关", "马来西亚商业发票"],
    keyCities: ["吉隆坡", "槟城", "新山", "亚庇", "马六甲"],
    userCount: "8,200+", docCount: "28,000+",
    tools: ["commercial-invoice", "proforma-invoice", "packing-list", "postal-code", "exchange-rate", "shipping-label"],
    guides: [
      { title: "马来西亚 SST 销售税登记与缴纳指南", description: "在马来西亚经营电商需了解 SST（Sales and Service Tax）注册门槛（年营业额超过 MYR 500,000）、税率（5-10%）及申报流程。", type: "tax" },
      { title: "马来西亚 Shopee/Lazada 跨境卖家入驻流程", description: "中国卖家如何入驻 Shopee 马来西亚站和 Lazada 马来西亚站：资质要求、保证金、物流方案选择、回款方式。", type: "guide" },
      { title: "马来西亚海关进口申报与关税起征点", description: "马来西亚进口关税起征点（MYR 500 以下免征）、SST 征收范围、低价值商品（LVG）税新规。", type: "customs" },
      { title: "中马物流专线与清关时效参考", description: "中国 → 吉隆坡空运专线（3-5 天）、海运拼箱（7-12 天），双清包税到门服务对比。", type: "logistics" },
    ],
    services: [
      { title: "马来西亚本地仓储与一件代发", category: "仓储", description: "巴生港、吉隆坡本地仓库，支持 Shopee/Lazada 平台订单一件代发、退换货处理。" },
      { title: "马来西亚清关代理服务", category: "报关", description: "持有 K1/K2 报关资质的代理公司，代理进出口清关、SST 代缴、产地证审核。" },
      { title: "东南亚跨境物流专线", category: "物流", description: "中国 → 马来西亚专线，空运（3-5 天）、海运（7-12 天），包清关到门，支持 COD。" },
    ],
  },
];

async function main() {
  for (const d of destinations) {
    // Upsert destination
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug, name: d.name, nameEn: d.nameEn, currency: d.currency,
        region: d.region, emoji: d.emoji, heroTitle: d.heroTitle,
        heroSubtitle: d.heroSubtitle, seoTitle: d.seoTitle,
        seoDescription: d.seoDescription, keywords: d.keywords,
        keyCities: d.keyCities, userCount: d.userCount, docCount: d.docCount,
      },
      update: {
        name: d.name, nameEn: d.nameEn, currency: d.currency,
        region: d.region, emoji: d.emoji, heroTitle: d.heroTitle,
        heroSubtitle: d.heroSubtitle, seoTitle: d.seoTitle,
        seoDescription: d.seoDescription, keywords: d.keywords,
        keyCities: d.keyCities, userCount: d.userCount, docCount: d.docCount,
      },
    });

    // Clear and recreate children (idempotent)
    await prisma.destinationTool.deleteMany({ where: { destinationId: dest.id } });
    await prisma.destinationGuide.deleteMany({ where: { destinationId: dest.id } });
    await prisma.destinationService.deleteMany({ where: { destinationId: dest.id } });

    await prisma.destinationTool.createMany({
      data: d.tools.map((toolSlug, i) => ({ destinationId: dest.id, toolSlug, sortOrder: i })),
    });
    await prisma.destinationGuide.createMany({
      data: d.guides.map((g, i) => ({ destinationId: dest.id, title: g.title, description: g.description, type: g.type, sortOrder: i })),
    });
    await prisma.destinationService.createMany({
      data: d.services.map((s, i) => ({ destinationId: dest.id, title: s.title, category: s.category, description: s.description, sortOrder: i })),
    });

    console.log(`✅ Seeded: ${d.emoji} ${d.name} (${d.slug})`);
  }

  const count = await prisma.destination.count();
  console.log(`\n🎉 Total destinations in DB: ${count}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
