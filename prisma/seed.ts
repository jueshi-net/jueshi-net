// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as bcrypt from "bcryptjs";
import * as path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 开始填充种子数据...");

  // 1. 用户
  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@xixiong.com" } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: { email: "admin@xixiong.com", name: "管理员", password: await bcrypt.hash("admin123", 10), role: "ADMIN", subdomain: "admin" },
    });
    console.log("✅ 管理员");
  }
  const existingUser = await prisma.user.findUnique({ where: { email: "test@xixiong.com" } });
  if (!existingUser) {
    await prisma.user.create({
      data: { email: "test@xixiong.com", name: "测试用户", password: await bcrypt.hash("test123", 10), role: "USER" },
    });
    console.log("✅ 测试用户");
  }

  // 2. 分类
  const cats = [
    { name: "国际快递", slug: "express", icon: "truck", sortOrder: 1 },
    { name: "物流查询", slug: "tracking", icon: "search", sortOrder: 2 },
    { name: "船公司", slug: "shipping", icon: "anchor", sortOrder: 3 },
    { name: "电商平台", slug: "ecommerce", icon: "shopping-bag", sortOrder: 4 },
    { name: "关务税务", slug: "customs", icon: "file-text", sortOrder: 5 },
    { name: "翻译服务", slug: "translation", icon: "languages", sortOrder: 6 },
    { name: "金融支付", slug: "finance", icon: "credit-card", sortOrder: 7 },
    { name: "实用工具", slug: "tools", icon: "wrench", sortOrder: 8 },
    { name: "内部系统", slug: "internal", icon: "building", sortOrder: 9 },
  ];
  const catMap: Record<string, string> = {};
  for (const c of cats) {
    const existing = await prisma.category.findUnique({ where: { slug: c.slug } });
    if (!existing) { const created = await prisma.category.create({ data: c }); catMap[c.slug] = created.id; }
    else { catMap[c.slug] = existing.id; }
  }
  console.log("✅ 分类");

  // 3. 链接（扩展更多实用网址）
  const links = [
    // 国际快递
    { title: "DHL", url: "https://www.dhl.com", description: "DHL全球快递查询", icon: "globe", slug: "express" },
    { title: "UPS", url: "https://www.ups.com", description: "联合包裹服务", icon: "shield", slug: "express" },
    { title: "FedEx", url: "https://www.fedex.com", description: "联邦快递", icon: "truck", slug: "express" },
    { title: "USPS", url: "https://www.usps.com", description: "美国邮政", icon: "mail", slug: "express" },
    { title: "TNT", url: "https://www.tnt.com", description: "TNT快递", icon: "truck", slug: "express" },

    // 物流查询
    { title: "17TRACK", url: "https://www.17track.net", description: "全球物流一站式查询", icon: "globe", slug: "tracking" },
    { title: "AfterShip", url: "https://www.aftership.com", description: "多快递追踪平台", icon: "search", slug: "tracking" },
    { title: "ParcelsApp", url: "https://parcelsapp.com", description: "国际包裹追踪", icon: "package", slug: "tracking" },
    { title: "快递100", url: "https://www.kuaidi100.com", description: "国内国际快递查询", icon: "search", slug: "tracking" },
    { title: "Cainiao", url: "https://global.cainiao.com", description: "菜鸟全球物流追踪", icon: "globe", slug: "tracking" },

    // 船公司
    { title: "Maersk", url: "https://www.maersk.com", description: "马士基航运", icon: "anchor", slug: "shipping" },
    { title: "COSCO", url: "https://www.coscoshipping.com", description: "中远海运", icon: "anchor", slug: "shipping" },
    { title: "MSC", url: "https://www.msc.com", description: "地中海航运", icon: "anchor", slug: "shipping" },
    { title: "CMA CGM", url: "https://www.cma-cgm.com", description: "达飞轮船", icon: "anchor", slug: "shipping" },
    { title: "ONE", url: "https://www.one-line.com", description: "海洋网联", icon: "anchor", slug: "shipping" },
    { title: "Hapag-Lloyd", url: "https://www.hapag-lloyd.com", description: "赫伯罗特", icon: "anchor", slug: "shipping" },
    { title: "EMC", url: "https://www.evergreen-marine.com", description: "长荣海运", icon: "anchor", slug: "shipping" },

    // 电商平台
    { title: "Amazon SC", url: "https://sellercentral.amazon.com", description: "Amazon Seller Central", icon: "shopping-cart", slug: "ecommerce" },
    { title: "Shopify", url: "https://admin.shopify.com", description: "独立站管理后台", icon: "shopping-bag", slug: "ecommerce" },
    { title: "eBay", url: "https://www.ebay.com/sh", description: "eBay Seller Hub", icon: "globe", slug: "ecommerce" },
    { title: "AliExpress", url: "https://sell.aliexpress.com", description: "速卖通卖家中心", icon: "shopping-cart", slug: "ecommerce" },
    { title: "Temu", url: "https://agentseller.temu.com", description: "Temu卖家中心", icon: "shopping-bag", slug: "ecommerce" },
    { title: "TikTok Shop", url: "https://seller.tiktokglobalshop.com", description: "TikTok Shop卖家", icon: "video", slug: "ecommerce" },
    { title: "SHEIN", url: "https://seller.shein.com", description: "SHEIN卖家中心", icon: "shopping-bag", slug: "ecommerce" },

    // 关务税务
    { title: "单一窗口", url: "https://www.singlewindow.cn", description: "中国国际贸易单一窗口", icon: "building", slug: "customs" },
    { title: "HS编码查询", url: "https://hscode.net", description: "海关税则号查询", icon: "hash", slug: "customs" },
    { title: "USITC", url: "https://hts.usitc.gov", description: "美国海关税则", icon: "flag", slug: "customs" },
    { title: "TARIC", url: "https://ec.europa.eu/taxation_customs/dds2/taric", description: "欧盟关税查询", icon: "globe", slug: "customs" },
    { title: "通关网", url: "https://www.ccn.com.cn", description: "报关税率查询", icon: "file-text", slug: "customs" },

    // 翻译服务
    { title: "Google翻译", url: "https://translate.google.com", description: "多语言在线翻译", icon: "languages", slug: "translation" },
    { title: "DeepL", url: "https://www.deepl.com", description: "AI精准翻译", icon: "languages", slug: "translation" },
    { title: "百度翻译", url: "https://fanyi.baidu.com", description: "中文特色翻译", icon: "languages", slug: "translation" },
    { title: "有道翻译", url: "https://fanyi.youdao.com", description: "网易有道词典", icon: "languages", slug: "translation" },
    { title: "腾讯翻译", url: "https://fanyi.qq.com", description: "腾讯交互翻译", icon: "languages", slug: "translation" },

    // 金融支付
    { title: "PayPal", url: "https://www.paypal.com", description: "PayPal商户平台", icon: "credit-card", slug: "finance" },
    { title: "WorldFirst", url: "https://www.worldfirst.com", description: "万里汇收款", icon: "dollar-sign", slug: "finance" },
    { title: "PingPong", url: "https://www.pingpongx.com", description: "PingPong收款", icon: "dollar-sign", slug: "finance" },
    { title: "Payoneer", url: "https://www.payoneer.com", description: "派安盈收款", icon: "credit-card", slug: "finance" },
    { title: "Xe汇率", url: "https://www.xe.com", description: "实时汇率查询", icon: "dollar-sign", slug: "finance" },

    // 实用工具
    { title: "体积计算器", url: "/tools/calculator", description: "材积重计算", icon: "calculator", slug: "tools" },
    { title: "汇率查询", url: "/tools/exchange-rate", description: "实时汇率转换", icon: "dollar-sign", slug: "tools" },
    { title: "邮编查询", url: "/tools/zip", description: "全球邮编查询", icon: "map-pin", slug: "tools" },
    { title: "云备忘录", url: "/tools/memo", description: "个人私密笔记", icon: "notebook", slug: "tools" },
    { title: "收据生成", url: "/tools/receipt", description: "快速收款凭证", icon: "receipt", slug: "tools" },
    { title: "发票生成", url: "/tools/invoice", description: "形式发票制作", icon: "file-text", slug: "tools" },
    { title: "报价单生成", url: "/tools/quote", description: "专业Quotation", icon: "file-text", slug: "tools" },
    { title: "入库单生成", url: "/tools/inbound", description: "仓库入库单据", icon: "warehouse", slug: "tools" },
    { title: "Nowmsg", url: "https://www.nowmsg.com", description: "全球邮编查询", icon: "map-pin", slug: "tools" },
    { title: "TimeAndDate", url: "https://www.timeanddate.com", description: "世界时区转换", icon: "clock", slug: "tools" },
  ];

  for (const l of links) {
    const existing = await prisma.linkItem.findFirst({ where: { title: l.title } });
    if (!existing) {
      const { slug, ...rest } = l;
      await prisma.linkItem.create({ data: { ...rest, categoryId: catMap[slug] || null, type: "PUBLIC" } });
    }
  }
  console.log(`✅ ${links.length}个链接`);

  // 4. 广告位
  const ads = [
    { name: "首页顶部横幅", position: "TOP_BANNER", code: "<!-- Google AdSense -->", enabled: true },
    { name: "侧边栏广告", position: "SIDEBAR_LEFT", code: "<!-- 侧边栏广告 -->", enabled: true },
    { name: "页脚广告", position: "FOOTER", code: "<!-- 页脚广告 -->", enabled: true },
  ];
  for (const a of ads) {
    const existing = await prisma.adSlot.findFirst({ where: { name: a.name } });
    if (!existing) await prisma.adSlot.create({ data: a });
  }
  console.log("✅ 广告位");

  // 5. 示例文章
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@xixiong.com" } });
  if (adminUser) {
    const sampleArticles = [
      {
        title: "国际集运物流常用工具汇总2024",
        slug: "logistics-tools-2024",
        summary: "整理了我日常使用的物流查询、关税计算、邮编查询等工具，外贸人必备清单。",
        content: `## 前言\n\n做国际物流集运，每天要和几十个网站打交道。这篇文章整理了我日常使用的工具分类：\n\n## 一、物流查询工具\n\n- **17Track** - 全球物流一站式查询，支持400+承运商\n- **各快递官网** - DHL、UPS、FedEx、USPS等\n- **集运商系统** - 融一、速鸟、亚美、德威\n\n## 二、计算工具\n\n- **体积计算器** - 材积重计算，支持不同除数\n- **汇率查询** - 实时汇率转换\n\n## 三、文档生成\n\n- **形式发票生成器** - Proforma Invoice\n- **收据生成器** - 收款凭证\n- **报价单** - 客户报价\n\n## 四、电商后台\n\n- Amazon Seller Central\n- Shopify Admin\n- eBay Seller Hub\n\n## 五、关务工具\n\n- **HS编码查询** - 中国海关税则号\n- **单一窗口** - 中国国际贸易单一窗口\n\n---\n\n*持续更新中，欢迎补充*`,
        tags: "教程,工具",
        status: "PUBLISHED" as const,
      },
      {
        title: "如何用17Track批量查询快递单号",
        slug: "17track-batch-tracking",
        summary: "17Track支持批量查询多个快递单号，一次最多可以查50个，非常适合外贸人员。",
        content: `## 17Track批量查询教程\n\n### 什么是批量查询？\n\n当你每天需要追踪几十个甚至上百个包裹时，一个一个查效率太低。\n\n### 操作步骤\n\n1. 打开 [17Track](https://www.17track.net)\n2. 点击「批量查询」\n3. 粘贴单号，每行一个\n4. 点击查询\n\n### 支持的快递\n\n- DHL, UPS, FedEx\n- 顺丰, 中通, 圆通, 韵达\n- 菜鸟, 燕文, 云途\n- 更多400+承运商\n\n### 注意事项\n\n- 一次最多50个单号\n- 建议保存查询列表\n- 注册账号可保存历史`,
        tags: "物流,教程",
        status: "PUBLISHED" as const,
      },
      {
        title: "材积重计算详解：不同快递公司的除数差异",
        slug: "volumetric-weight-guide",
        summary: "DHL用4000，FedEx用5000，UPS用6000，不同公司的材积计算方式差异很大。",
        content: `## 材积重是什么？\n\n材积重 = 长(cm) × 宽(cm) × 高(cm) ÷ 除数\n\n## 各公司除数\n\n| 公司 | 除数 | 说明 |\n|------|------|------|\n| DHL | 4000 | 最严格 |\n| FedEx | 5000 | 标准 |\n| UPS | 6000 | 最宽松 |\n\n## 实际案例\n\n一个包裹 50×40×30cm：\n- 实际重量：5kg\n- DHL材积：50×40×30÷4000 = 15kg\n- FedEx材积：50×40×30÷5000 = 12kg\n- UPS材积：50×40×30÷6000 = 10kg\n\n## 省钱技巧\n\n- 选择除数大的快递\n- 压缩包装体积\n- 不规则物品按最凸出点测量`,
        tags: "知识,计算",
        status: "PUBLISHED" as const,
      },
      {
        title: "跨境电商收款方式对比：PayPal vs PingPong vs WorldFirst",
        slug: "payment-methods-comparison",
        summary: "PayPal适合小额，万里汇费率低，PingPong支持平台多，一文对比主流收款方式。",
        content: `## 主流收款方式对比\n\n### PayPal\n- 费率：3.4% + 固定费用\n- 优点：买家信任度高\n- 缺点：费率高，提现不便\n\n### WorldFirst（万里汇）\n- 费率：0.3% 封顶\n- 支持平台：Amazon, Shopify, eBay\n- 提现：直接到国内银行卡\n\n### PingPong\n- 费率：1% 封顶\n- 支持平台最多\n- 有VISA卡可消费\n\n### Payoneer\n- 费率：2%\n- 适合自由职业者\n- 支持多币种\n\n## 建议\n\n- 小额B2C：PayPal\n- 跨境电商：万里汇/PingPong\n- 自由职业：Payoneer`,
        tags: "金融,电商",
        status: "PUBLISHED" as const,
      },
    ];

    for (const article of sampleArticles) {
      const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
      if (!existing) {
        await prisma.article.create({
          data: {
            ...article,
            authorId: adminUser.id,
            views: Math.floor(Math.random() * 500) + 100,
            publishedAt: new Date(),
          },
        });
        console.log(`✅ 文章: ${article.title}`);
      }
    }
  }

  // 6. 为已有用户创建工作区
  const usersWithoutWorkspace = await prisma.user.findMany({
    where: { workspace: { is: null } },
  });
  for (const user of usersWithoutWorkspace) {
    await prisma.workspace.create({
      data: { userId: user.id, title: `${user.name || "我的"}工作台` },
    });
    console.log(`✅ 工作区: ${user.email}`);
  }

  console.log("\n🎉 种子数据填充完成！");
  console.log("📧 admin@xixiong.com / admin123");
  console.log("📧 test@xixiong.com / test123");
}

main()
  .catch((e) => { console.error("❌ 种子数据填充失败:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
