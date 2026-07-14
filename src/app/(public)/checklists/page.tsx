import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks, Home, ChevronRight, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import PublicCategoryPageFrame from '@/components/templates/PublicCategoryPageFrame';
import { SectionHeader, ContentSection } from '@/components/design-system';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "清单 - 绝世百宝箱",
  description: "实用的出海行动清单:留学生行李准备、集运发货核对、多伦多租房看房避坑。",
  keywords: "清单,出国清单,留学清单,集运清单,租房清单,行李清单,发货清单,checklist,出海清单,海外生活清单",
  alternates: { canonical: "https://jueshi.net/checklists" },
  openGraph: {
    title: "清单 - 绝世百宝箱",
    description: "实用的出海行动清单:留学生行李准备、集运发货核对、多伦多租房看房避坑。",
    url: "https://jueshi.net/checklists",
    type: "website",
  },
};

async function getChecklists() {
  try {
    // Get checklists from both landingPage and checklist tables
    const landingChecklists = await prisma.landingPage.findMany({
      where: {
        status: "published",
        pageType: "checklist",
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        seoDescription: true,
        heroSection: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    const modelChecklists = await prisma.checklist.findMany({
      where: {
        status: "published",
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        seoDescription: true,
        summary: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    // Merge and deduplicate by slug
    const allChecklists = new Map<string, any>();
    
    // Add landingPage checklists
    landingChecklists.forEach((cl) => {
      allChecklists.set(cl.slug, {
        ...cl,
        source: "landingPage",
      });
    });

    // Add checklist model checklists (override if duplicate)
    modelChecklists.forEach((cl) => {
      if (!allChecklists.has(cl.slug)) {
        allChecklists.set(cl.slug, {
          id: cl.id,
          slug: cl.slug,
          title: cl.title,
          seoDescription: cl.seoDescription || cl.summary,
          heroSection: null, // checklist model doesn't have heroSection
          publishedAt: cl.publishedAt,
          updatedAt: cl.updatedAt,
          source: "checklist",
        });
      }
    });

    return Array.from(allChecklists.values());
  } catch {
    return [];
  }
}

export default async function ChecklistsPage() {
  const checklists = await getChecklists();

  return (
    <JueshiV4PublicShell>
      <PublicCategoryPageFrame
        title="实用清单"
        description="从出国行李打包到国际集运发货,从海外租房到看房避坑,每一步都有可勾选的行动清单。"
        icon={<ListChecks className="w-6 h-6" />}
      >
        <div className="-mt-6 pb-16 relative z-10">
          {/* Checklist cards - 使用 Design System */}
          <ContentSection>
            {checklists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {checklists.map((cl) => {
                  const hero = (cl.heroSection as any) || {};
                  const sections = (hero.sections as any[] | null) || [];
                  const totalItems = sections.reduce((sum, s) => sum + ((s.items as any[] | null)?.length || 0), 0);
                  const estimatedTime = hero.estimatedTime as string | null;
                  const summary = hero.summary as string | null;
                  const audience = hero.audience as string | null;

                  return (
                    <Link
                      key={cl.id}
                      href={`/checklists/${cl.slug}`}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-teal-300 transition-all flex flex-col"
                    >
                      <div className="p-5 md:p-6 flex-1">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50 border-2 border-teal-100">
                            <ListChecks className="w-4 h-4 text-teal-600" />
                          </div>
                          {estimatedTime && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                              ⏱ {estimatedTime}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors mb-1 line-clamp-2">
                          {cl.title}
                        </h2>
                        {audience && (
                          <p className="text-sm text-gray-400 mb-1">{audience}</p>
                        )}
                        {summary && (
                          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{summary}</p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 md:px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {totalItems} 项
                          </span>
                          <span className="flex items-center gap-1">
                            📋 {sections.length} 个板块
                          </span>
                        </div>
                        <span className="text-sm text-teal-600 font-medium group-hover:text-teal-700 transition-colors inline-flex items-center gap-1">
                          查看清单
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">暂无清单</h2>
                <p className="text-sm text-gray-500 mb-6">我们正在准备更多实用清单,敬请期待。</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/tools" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors min-h-[44px]">
                    🛠️ 工具中心
                  </Link>
                  <Link href="/topics" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors min-h-[44px]">
                    📖 专题推荐
                  </Link>
                </div>
              </div>
            )}
          </ContentSection>
        </div>
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
  );
}
