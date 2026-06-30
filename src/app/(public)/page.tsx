import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/home/hero-new";
import QuickToolsGrid from "@/components/home/quick-tools-grid";
import WorkflowPath from "@/components/home/workflow-path";
import HomeAd from "@/components/home/home-ad";
import DocumentToolsSection from "@/components/home/document-tools-section";
import CommunitySection from "@/components/home/community-section";
import PremiumSection from "@/components/home/premium-section";
import SEOSection from "@/components/home/seo-section";
import PartnerLogos from "@/components/home/partner-logos";
import { AD_SLOTS } from "@/lib/ad-slots";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://jueshi.net/" },
};

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
      <QuickToolsGrid />
      <WorkflowPath />
      <DocumentToolsSection />
      <CommunitySection />
      <PremiumSection />
      <SEOSection />
      <PartnerLogos />
    </>
  );
}
