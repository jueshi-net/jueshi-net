// Comprehensive seed script for 跨境百宝箱
// Run: node --env-file=.env prisma/seed-all.js

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const dbUrl = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('🌱 Starting comprehensive seed...\n');

  // 1. Categories
  console.log('📂 Seeding categories...');
  const categories = [
    { name: '快递查询', slug: 'express', icon: '📦', color: 'blue', sortOrder: 1 },
    { name: '物流公司', slug: 'logistics', icon: '🚚', color: 'green', sortOrder: 2 },
    { name: '船公司', slug: 'shipping', icon: '🚢', color: 'cyan', sortOrder: 3 },
    { name: '跨境电商', slug: 'ecommerce', icon: '🛒', color: 'orange', sortOrder: 4 },
    { name: '关务/海关', slug: 'customs', icon: '🏛️', color: 'purple', sortOrder: 5 },
    { name: '翻译工具', slug: 'translation', icon: '🌐', color: 'indigo', sortOrder: 6 },
    { name: '支付/金融', slug: 'payment', icon: '💰', color: 'red', sortOrder: 7 },
    { name: '常用工具', slug: 'tools', icon: '🔧', color: 'gray', sortOrder: 8 },
    { name: '外贸学习', slug: 'learning', icon: '📚', color: 'yellow', sortOrder: 9 },
  ];

  for (const cat of categories) {
    await prisma.category.createMany({
      data: [cat],
      skipDuplicates: true,
    });
  }
  console.log(`  ✅ ${categories.length} categories`);

  // 2. Tags
  console.log('🏷️  Seeding tags...');
  const tagNames = ['物流', '快递', '电商', '支付', '翻译', '海关', '工具', '热门', '推荐'];
  await prisma.tag.createMany({
    data: tagNames.map(name => ({ name })),
    skipDuplicates: true,
  });
  console.log(`  ✅ ${tagNames.length} tags`);

  // 3. Links
  console.log('🔗 Seeding links...');
  const links = [
    { title: '顺丰速运', url: 'https://www.sf-express.com', description: '顺丰快递官方查询，支持国内国际件追踪', categoryName: '快递查询', icon: '📦', isFeatured: true },
    { title: '中通快递', url: 'https://www.zto.com', description: '中通快递运单查询', categoryName: '快递查询', icon: '📦' },
    { title: '圆通速递', url: 'https://www.yto.net.cn', description: '圆通快递物流追踪', categoryName: '快递查询', icon: '📦' },
    { title: '韵达快递', url: 'https://www.yundaex.com', description: '韵达快递查询', categoryName: '快递查询', icon: '📦' },
    { title: '申通快递', url: 'https://www.sto.cn', description: '申通快递追踪', categoryName: '快递查询', icon: '📦' },
    { title: '京东物流', url: 'https://www.jdl.cn', description: '京东物流查询', categoryName: '快递查询', icon: '📦' },
    { title: 'EMS中国邮政', url: 'https://www.ems.com.cn', description: 'EMS国际国内邮件查询', categoryName: '快递查询', icon: '📦', isFeatured: true },
    { title: '极兔速递', url: 'https://www.jtexpress.com.cn', description: '极兔快递查询', categoryName: '快递查询', icon: '📦' },
    { title: 'DHL', url: 'https://www.dhl.com', description: 'DHL国际快递查询', categoryName: '物流公司', icon: '🚚', isFeatured: true },
    { title: 'FedEx', url: 'https://www.fedex.com', description: 'FedEx联邦快递追踪', categoryName: '物流公司', icon: '🚚' },
    { title: 'UPS', url: 'https://www.ups.com', description: 'UPS联合包裹追踪', categoryName: '物流公司', icon: '🚚' },
    { title: 'TNT', url: 'https://www.tnt.com', description: 'TNT快递查询', categoryName: '物流公司', icon: '🚚' },
    { title: '菜鸟国际', url: 'https://global.cainiao.com', description: '菜鸟国际物流追踪', categoryName: '物流公司', icon: '🚚', isFeatured: true },
    { title: '17Track', url: 'https://www.17track.net', description: '全球包裹追踪平台', categoryName: '物流公司', icon: '🌍' },
    { title: 'AfterShip', url: 'https://www.aftership.com', description: '多承运商物流追踪', categoryName: '物流公司', icon: '🌍' },
    { title: 'ParcelLab', url: 'https://www.parcellab.com', description: '智能物流追踪平台', categoryName: '物流公司', icon: '🌍' },
    { title: '马士基 Maersk', url: 'https://www.maersk.com', description: '全球最大集装箱航运公司', categoryName: '船公司', icon: '🚢', isFeatured: true },
    { title: '地中海航运 MSC', url: 'https://www.msc.com', description: '全球第二大集装箱船公司', categoryName: '船公司', icon: '🚢' },
    { title: '达飞轮船 CMA CGM', url: 'https://www.cma-cgm.com', description: '法国达飞海运集团', categoryName: '船公司', icon: '🚢' },
    { title: '中远海运 COSCO', url: 'https://www.coscoshipping.com', description: '中国远洋海运集团', categoryName: '船公司', icon: '🚢', isFeatured: true },
    { title: '赫伯罗特 Hapag-Lloyd', url: 'https://www.hapag-lloyd.com', description: '德国集装箱航运公司', categoryName: '船公司', icon: '🚢' },
    { title: '长荣海运 Evergreen', url: 'https://www.evergreen-marine.com', description: '台湾长荣海运', categoryName: '船公司', icon: '🚢' },
    { title: 'ONE 海洋网联', url: 'https://www.one-line.com', description: '日本海洋网联船务', categoryName: '船公司', icon: '🚢' },
    { title: 'Shopify', url: 'https://www.shopify.com', description: '全球领先独立站电商平台', categoryName: '跨境电商', icon: '🛒', isFeatured: true },
    { title: 'Amazon Seller Central', url: 'https://sellercentral.amazon.com', description: '亚马逊卖家后台', categoryName: '跨境电商', icon: '🛒' },
    { title: '速卖通', url: 'https://www.aliexpress.com', description: '阿里巴巴国际站', categoryName: '跨境电商', icon: '🛒' },
    { title: 'eBay', url: 'https://www.ebay.com', description: '全球C2C电商平台', categoryName: '跨境电商', icon: '🛒' },
    { title: 'WooCommerce', url: 'https://woocommerce.com', description: 'WordPress电商插件', categoryName: '跨境电商', icon: '🛒' },
    { title: 'Temu', url: 'https://www.temu.com', description: '拼多多跨境电商平台', categoryName: '跨境电商', icon: '🛒' },
    { title: '中国海关总署', url: 'http://www.customs.gov.cn', description: '中国海关官方门户', categoryName: '关务/海关', icon: '🏛️', isFeatured: true },
    { title: '单一窗口', url: 'https://www.singlewindow.cn', description: '中国国际贸易单一窗口', categoryName: '关务/海关', icon: '🏛️' },
    { title: 'HS编码查询', url: 'https://hs.bianmaw.com', description: 'HS编码在线查询工具', categoryName: '关务/海关', icon: '🏛️' },
    { title: '各国关税查询', url: 'https://www.zoll.de', description: '国际关税税率查询', categoryName: '关务/海关', icon: '🏛️' },
    { title: 'WCO世界海关组织', url: 'https://www.wcoomd.org', description: '世界海关组织官网', categoryName: '关务/海关', icon: '🏛️' },
    { title: 'DeepL翻译', url: 'https://www.deepl.com', description: 'AI高质量翻译引擎', categoryName: '翻译工具', icon: '🌐', isFeatured: true },
    { title: 'Google翻译', url: 'https://translate.google.com', description: '谷歌在线翻译', categoryName: '翻译工具', icon: '🌐' },
    { title: '百度翻译', url: 'https://fanyi.baidu.com', description: '百度在线翻译', categoryName: '翻译工具', icon: '🌐' },
    { title: '有道翻译', url: 'https://fanyi.youdao.com', description: '网易有道翻译', categoryName: '翻译工具', icon: '🌐' },
    { title: 'PayPal', url: 'https://www.paypal.com', description: '全球在线支付解决方案', categoryName: '支付/金融', icon: '💰', isFeatured: true },
    { title: 'Stripe', url: 'https://stripe.com', description: '互联网支付基础设施', categoryName: '支付/金融', icon: '💰' },
    { title: '万里汇 WorldFirst', url: 'https://www.worldfirst.com.cn', description: '跨境电商收款平台', categoryName: '支付/金融', icon: '💰' },
    { title: 'PingPong', url: 'https://www.pingpongx.com', description: '跨境贸易数字化服务商', categoryName: '支付/金融', icon: '💰' },
    { title: '连连支付', url: 'https://www.lianlianpay.com', description: '跨境支付解决方案', categoryName: '支付/金融', icon: '💰' },
    { title: 'XTransfer', url: 'https://www.xtransfer.com', description: '外贸B2B收付款平台', categoryName: '支付/金融', icon: '💰' },
    { title: '汇率查询', url: 'https://www.xe.com', description: '实时汇率查询', categoryName: '常用工具', icon: '💱', isFeatured: true },
    { title: '时区转换器', url: 'https://www.timeanddate.com', description: '世界时区时间转换', categoryName: '常用工具', icon: '⏰' },
    { title: '单位换算', url: 'https://www.unitconverters.net', description: '重量/体积/长度换算', categoryName: '常用工具', icon: '📐' },
    { title: '二维码生成', url: 'https://www.qr-code-generator.com', description: '免费在线二维码生成', categoryName: '常用工具', icon: '📱' },
    { title: '福步外贸论坛', url: 'https://www.fobshanghai.com', description: '中国最大外贸社区', categoryName: '外贸学习', icon: '📚', isFeatured: true },
    { title: '雨果跨境', url: 'https://www.cifnews.com', description: '跨境电商资讯平台', categoryName: '外贸学习', icon: '📚' },
    { title: '跨境知道', url: 'https://www.ikjzd.com', description: '跨境电商知识社区', categoryName: '外贸学习', icon: '📚' },
  ];

  // Get category map
  const allCats = await prisma.category.findMany();
  const catMap = {};
  for (const cat of allCats) {
    catMap[cat.name] = cat.id;
  }

  // Check existing URLs
  const existingUrls = new Set(
    (await prisma.linkItem.findMany({ select: { url: true } })).map(l => l.url)
  );

  const newLinks = links
    .filter(l => !existingUrls.has(l.url))
    .map(l => ({
      title: l.title,
      url: l.url,
      description: l.description,
      icon: l.icon,
      categoryName: l.categoryName,
      categoryId: catMap[l.categoryName] || null,
      isFeatured: l.isFeatured || false,
      status: 'active',
    }));

  if (newLinks.length > 0) {
    await prisma.linkItem.createMany({ data: newLinks });
  }
  console.log(`  ✅ ${newLinks.length} new links (${links.length} total)`);

  // 4. Articles
  console.log('📝 Seeding articles...');
  const articles = [
    {
      title: '国际物流体积重量计算详解：CBM与计费重量',
      slug: 'volume-weight-calculation-guide',
      content: '在国际物流中，体积重量（Volumetric Weight）是计算运费的重要依据。本文详细介绍CBM计算方法、体积重量公式、以及不同运输方式的计费标准。包括海运、空运、快递的体积系数差异，如何优化包装节省运费等实用技巧。',
      excerpt: '详细介绍国际物流中的体积重量计算方法，帮助外贸人员优化包装、节省运费。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['物流', '工具', '热门'],
    },
    {
      title: '2024年跨境电商物流渠道对比：哪个更划算？',
      slug: 'cross-border-logistics-comparison-2024',
      content: '跨境电商卖家面临众多物流选择：邮政小包、专线物流、海外仓、FBA等。本文从时效、价格、覆盖范围、清关能力等维度，全面对比主流跨境物流渠道，帮助卖家选择最适合的方案。',
      excerpt: '全面对比2024年主流跨境物流渠道，从时效、价格、清关等维度帮你选择最优方案。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['物流', '电商', '推荐'],
    },
    {
      title: 'HS编码查询与归类指南：避免海关扣货',
      slug: 'hs-code-classification-guide',
      content: 'HS编码（Harmonized System Code）是国际贸易中商品分类的标准编码系统。正确的HS编码归类关系到关税税率、监管条件、甚至能否顺利通关。本文讲解HS编码结构、归类规则、常见错误及解决方案。',
      excerpt: 'HS编码正确归类对通关至关重要，本文教你如何准确查询和归类HS编码。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['海关', '工具'],
    },
    {
      title: '跨境支付收款方式全攻略：PayPal、Stripe、万里汇对比',
      slug: 'cross-border-payment-methods',
      content: '跨境电商卖家如何安全高效地收款？本文对比PayPal、Stripe、万里汇、PingPong、连连支付等主流跨境支付工具的费率、到账时间、支持币种、风控政策，帮助你选择最合适的收款方案。',
      excerpt: '对比主流跨境支付工具费率、到账时间、支持币种，帮你选择最佳收款方案。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['支付', '电商', '热门'],
    },
    {
      title: '全球主要船公司航线与时效查询指南',
      slug: 'shipping-line-routes-guide',
      content: '了解全球主要船公司（马士基、MSC、达飞、中远海运等）的航线布局、港口挂靠、航程时效，对于安排国际海运至关重要。本文整理各大船公司的优势航线和时效参考。',
      excerpt: '整理全球主要船公司航线布局与时效参考，帮助外贸人员合理安排海运。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['物流', '热门'],
    },
    {
      title: '外贸必备翻译工具推荐：DeepL vs Google翻译',
      slug: 'translation-tools-for-trade',
      content: '外贸工作中经常需要处理多语言文档。DeepL凭借AI翻译质量脱颖而出，Google翻译覆盖面更广。本文对比两者的优劣，并推荐其他实用的外贸翻译工具。',
      excerpt: '对比DeepL和Google翻译等外贸翻译工具，帮你提升多语言工作效率。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['翻译', '工具'],
    },
    {
      title: '中国出口报关流程详解：从准备到放行',
      slug: 'china-export-customs-process',
      content: '出口报关是国际贸易的关键环节。本文详细介绍中国出口报关的完整流程：准备报关单据、单一窗口申报、海关审单、查验、放行，以及常见问题的处理方法。',
      excerpt: '详细讲解中国出口报关全流程，从单据准备到海关放行的每一步。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['海关', '物流'],
    },
    {
      title: 'Shopify独立站建站教程：从零到上线',
      slug: 'shopify-store-setup-guide',
      content: 'Shopify是全球最受欢迎的独立站电商平台。本文从注册账号、选择主题、添加产品、设置支付物流、到域名绑定，手把手教你搭建一个专业的跨境电商独立站。',
      excerpt: '手把手教你用Shopify搭建专业跨境电商独立站，从注册到上线全流程。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['电商', '工具', '推荐'],
    },
    {
      title: '国际快递追踪技巧：多平台查询与异常处理',
      slug: 'international-tracking-tips',
      content: '国际包裹追踪经常遇到信息更新延迟、多段运输追踪断档等问题。本文介绍如何使用17Track、AfterShip等多平台工具追踪包裹，以及遇到异常情况时的处理方法。',
      excerpt: '教你使用多平台工具追踪国际包裹，以及处理追踪异常的实用技巧。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['快递', '工具'],
    },
    {
      title: '跨境电商税务合规：VAT与进口关税基础知识',
      slug: 'cross-border-tax-compliance',
      content: '跨境电商涉及多国税务合规问题。本文讲解欧盟VAT、美国销售税、进口关税的基本知识，以及如何合规申报、避免税务风险。适合刚入行的跨境电商卖家。',
      excerpt: '讲解欧盟VAT、美国销售税、进口关税等跨境税务合规基础知识。',
      status: 'PUBLISHED',
      author: '百宝箱编辑',
      tags: ['海关', '支付'],
    },
  ];

  const existingSlugs = new Set(
    (await prisma.article.findMany({ select: { slug: true } })).map(a => a.slug)
  );

  for (const art of articles) {
    if (existingSlugs.has(art.slug)) continue;
    const article = await prisma.article.create({
      data: {
        title: art.title,
        slug: art.slug,
        content: art.content,
        excerpt: art.excerpt,
        status: art.status,
        author: art.author,
        views: Math.floor(Math.random() * 5000) + 100,
        publishedAt: new Date(),
      },
    });
    for (const tagName of art.tags) {
      await prisma.articleTag.create({
        data: { articleId: article.id, tag: tagName },
      });
    }
  }
  console.log(`  ✅ ${articles.length} articles`);

  // 5. Ad Slots
  console.log('📢 Seeding ad slots...');
  const existingAds = new Set(
    (await prisma.adSlot.findMany({ select: { name: true } })).map(a => a.name)
  );
  const ads = [
    { name: '首页顶部Banner', position: 'home-top', imageUrl: '/placeholder-ad.jpg', linkUrl: 'https://example.com', altText: '跨境物流优惠', isActive: true },
    { name: '工具页侧边栏', position: 'tools-sidebar', imageUrl: '/placeholder-ad.jpg', linkUrl: 'https://example.com', altText: '支付工具推荐', isActive: true },
    { name: '文章页底部', position: 'article-bottom', imageUrl: '/placeholder-ad.jpg', linkUrl: 'https://example.com', altText: '外贸服务推广', isActive: true },
  ];
  const newAds = ads.filter(a => !existingAds.has(a.name)).map(a => ({
    ...a,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  }));
  if (newAds.length > 0) {
    await prisma.adSlot.createMany({ data: newAds });
  }
  console.log(`  ✅ ${newAds.length} ad slots`);

  // 6. Subscription Plans
  console.log('💎 Seeding subscription plans...');
  const plans = [
    { name: '免费版', slug: 'free', description: '基础工具免费使用', price: 0, interval: 'forever', features: '["基础工具","每日查询10次","标准客服"]', isActive: true },
    { name: '专业版', slug: 'pro', description: '解锁全部工具，无限制查询', price: 29.9, interval: 'monthly', features: '["全部工具","无限查询","优先客服","API接入"]', isActive: true },
    { name: '企业版', slug: 'enterprise', description: '团队协作 + 专属支持', price: 99.9, interval: 'monthly', features: '["全部功能","团队协作","专属客服","定制开发","SLA保障"]', isActive: true },
  ];
  const existingPlans = new Set(
    (await prisma.subscription.findMany({ select: { slug: true } })).map(p => p.slug)
  );
  const newPlans = plans.filter(p => !existingPlans.has(p.slug));
  if (newPlans.length > 0) {
    await prisma.subscription.createMany({ data: newPlans });
    const planData = newPlans.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      interval: p.interval,
      features: p.features,
      isActive: p.isActive,
    }));
    await prisma.subscriptionPlan.createMany({ data: planData });
  }
  console.log(`  ✅ ${newPlans.length} subscription plans`);

  // 7. Demo User
  console.log('👤 Seeding demo user...');
  try {
    await prisma.user.create({
      data: {
        name: 'Demo用户',
        email: 'demo@kjbxb.com',
        role: 'user',
        password: 'demo123456',
      },
    });
    console.log('  ✅ Demo user');
  } catch (e) {
    console.log('  ⏭️  Demo user already exists');
  }

  console.log('\n🎉 Seed complete! Summary:');
  const [catCount, totalLinks, artCount, adCount, tagCount, subCount, userCount] = await Promise.all([
    prisma.category.count(),
    prisma.linkItem.count(),
    prisma.article.count(),
    prisma.adSlot.count(),
    prisma.tag.count(),
    prisma.subscription.count(),
    prisma.user.count(),
  ]);
  console.log(`  Categories: ${catCount}`);
  console.log(`  Links: ${totalLinks}`);
  console.log(`  Articles: ${artCount}`);
  console.log(`  Ad Slots: ${adCount}`);
  console.log(`  Tags: ${tagCount}`);
  console.log(`  Subscriptions: ${subCount}`);
  console.log(`  Users: ${userCount}`);

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
