// Server Component: Content center dashboard — fetches aggregate stats from prisma
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BookOpen, ListChecks, LayoutTemplate, FolderOpen, ArrowRight, CheckCircle, FileEdit } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "内容中心 — 管理后台",
  robots: { index: false, follow: false },
};

export default async function ContentCenterPage() {
  const [
    guideTotal, guidePublished, guideDraft, guideArchived,
    checklistTotal, checklistPublished, checklistDraft, checklistArchived,
    landingPageTotal, landingPagePublished, landingPageDraft,
    topicTotal, topicPublished, topicDraft,
  ] = await Promise.all([
    prisma.guide.count(),
    prisma.guide.count({ where: { status: "published" } }),
    prisma.guide.count({ where: { status: "draft" } }),
    prisma.guide.count({ where: { status: "archived" } }),
    prisma.checklist.count(),
    prisma.checklist.count({ where: { status: "published" } }),
    prisma.checklist.count({ where: { status: "draft" } }),
    prisma.checklist.count({ where: { status: "archived" } }),
    prisma.landingPage.count(),
    prisma.landingPage.count({ where: { status: "published" } }),
    prisma.landingPage.count({ where: { status: "draft" } }),
    prisma.topic.count(),
    prisma.topic.count({ where: { status: "published" } }),
    prisma.topic.count({ where: { status: "draft" } }),
  ]);

  const publishedTotal = guidePublished + checklistPublished + landingPagePublished + topicPublished;
  const draftTotal = guideDraft + checklistDraft + landingPageDraft + topicDraft;

  const cards = [
    {
      href: "/admin/content/guides",
      title: "指南",
      icon: BookOpen,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      total: guideTotal,
      published: guidePublished,
      draft: guideDraft,
      archived: guideArchived,
    },
    {
      href: "/admin/content/checklists",
      title: "清单",
      icon: ListChecks,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      total: checklistTotal,
      published: checklistPublished,
      draft: checklistDraft,
      archived: checklistArchived,
    },
    {
      href: "/admin/landing-pages",
      title: "落地页",
      icon: LayoutTemplate,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      total: landingPageTotal,
      published: landingPagePublished,
      draft: landingPageDraft,
      archived: 0,
    },
    {
      href: "/admin/topics",
      title: "专题",
      icon: FolderOpen,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      total: topicTotal,
      published: topicPublished,
      draft: topicDraft,
      archived: 0,
    },
  ];

  return (
    <AdminPageFrame
      title="内容中心"
      description="管理指南、清单、落地页、专题等内容资源"
      icon={<BookOpen className="w-5 h-5" />}
      variant="detail"
    >
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="text-sm text-gray-500 mb-1">内容总数</div>
          <div className="text-2xl font-bold text-gray-900">
            {guideTotal + checklistTotal + landingPageTotal + topicTotal}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" /> 已发布
          </div>
          <div className="text-2xl font-bold text-green-600">{publishedTotal}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <FileEdit className="w-4 h-4 text-amber-500" /> 草稿
          </div>
          <div className="text-2xl font-bold text-amber-600">{draftTotal}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="text-sm text-gray-500 mb-1">内容类型</div>
          <div className="text-2xl font-bold text-gray-900">4</div>
        </div>
      </div>

      {/* Content type cards */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">内容类型</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <span className="text-lg font-semibold text-gray-900">{card.title}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900">{card.total}</span>
              <span className="text-sm text-gray-400">条内容</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                已发布 {card.published}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                草稿 {card.draft}
              </span>
              {card.archived > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  已归档 {card.archived}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </AdminPageFrame>
  );
}
