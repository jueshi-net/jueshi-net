import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.landingPage.findUnique({
    where: { slug: "test-safe-landing-20" },
  });

  if (existing) {
    console.log("Test landing page already exists:", existing.id, "status:", existing.status);
    process.exit(0);
  }

  // Get some real article slugs
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    take: 3,
    select: { slug: true },
  });

  const page = await prisma.landingPage.create({
    data: {
      slug: "test-safe-landing-20",
      title: "【测试页 v20】出海经营一站式导航",
      seoTitle: "出海经营工具导航 - 海外百宝箱",
      seoDescription: "汇集运费估算、HS编码、敏感物品查询等出海必备工具，一站式解决跨境物流与合规问题。",
      pageType: "landing",
      status: "published",
      heroSection: {
        title: "🚀 出海经营一站式导航",
        subtitle: "从物流估算到合规查询，百宝箱精选工具助你轻松拓展海外市场",
        ctaText: "立即使用工具",
        ctaUrl: "/tools",
      },
      primaryTool: "shipping-calculator",
      relatedTools: ["hs-code", "sensitive-goods", "postal-code", "address-formatter", "invoice"],
      relatedTopics: [],
      relatedArticles: articles.map(a => a.slug),
      faqItems: [
        { question: "这些工具都免费吗？", answer: "是的，海外百宝箱所有在线工具均免费使用，无需注册。" },
        { question: "运费估算准确吗？", answer: "运费估算基于各快递公司公开报价，仅供参考。实际费用请以快递公司官方报价为准。" },
        { question: "HS编码可以用作正式报关吗？", answer: "本站提供的HS编码仅供参考，不同国家/地区的分类可能存在差异。正式报关请咨询专业报关行。" },
      ],
      officialLinks: [
        { label: "DHL 官网", url: "https://www.dhl.com", icon: "📦" },
        { label: "FedEx 官网", url: "https://www.fedex.com", icon: "🚚" },
        { label: "UPS 官网", url: "https://www.ups.com", icon: "📮" },
      ],
      ctaConfig: {
        text: "开始使用百宝箱工具",
        url: "/tools",
        style: "primary",
      },
      adPlacements: [
        { placementKey: "landing.block_between", enabled: true },
      ],
      publishedAt: new Date(),
    },
  });

  console.log("Created test landing page:", page.id);
  console.log("Slug:", page.slug);
  console.log("Status:", page.status);
  console.log("URL: https://jueshi.net/lp/test-safe-landing-20");
}

main().catch(console.error).finally(() => prisma.$disconnect());
