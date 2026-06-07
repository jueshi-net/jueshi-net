import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/home/hero-new";
import CategoryCards from "@/components/home/category-cards";
import PlatformStats from "@/components/home/platform-stats";
import PopularToolsDynamic from "@/components/home/popular-tools-dynamic";
import HomeAd from "@/components/home/home-ad";
import DocumentToolsSection from "@/components/home/document-tools-section";
import TopicsDynamic from "@/components/home/topics-dynamic";
import CommunitySection from "@/components/home/community-section";
import PremiumSection from "@/components/home/premium-section";
import SEOSection from "@/components/home/seo-section";
import PartnerLogos from "@/components/home/partner-logos";
import { AD_SLOTS } from "@/lib/ad-slots";

async function getRealStats() {
  try {
    const [tools, users, docs, topics] = await Promise.all([
      prisma.tool.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.toolDocumentDraft.count(),
      prisma.topic.count({ where: { status: "published" } }),
    ]);
    return { tools, users, docs, topics };
  } catch {
    return { tools: 0, users: 0, docs: 0, topics: 0 };
  }
}

export default async function HomePage() {
  const stats = await getRealStats();

  return (
    <>
      <HeroSection stats={stats} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <HomeAd slot={AD_SLOTS.HOME_HERO} />
      </div>
      <CategoryCards />
      <PlatformStats stats={stats} />
      <PopularToolsDynamic />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <HomeAd slot={AD_SLOTS.HOME_POPULAR} />
      </div>
      <DocumentToolsSection />
      <TopicsDynamic />
      <CommunitySection />
      <PremiumSection />
      <SEOSection />
      <PartnerLogos />
    </>
  );
}
