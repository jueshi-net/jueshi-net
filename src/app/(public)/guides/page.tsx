import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { FileText, CalendarDays, Eye, Clock, ChevronRight, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import PublicCategoryPageFrame from '@/components/templates/PublicCategoryPageFrame';
import { SectionHeader, ContentSection, PageCTA } from '@/components/design-system';

export const metadata: Metadata = {
  title: '海外实用指南 - 跨境寄送、海外生活、出海经营',
  description: '面向出海商家、海外华人、留学生的工具教程、避坑指南与实操经验。',
  keywords: "指南,海外指南,跨境指南,出海指南,留学指南,外贸指南,教程,避坑指南,实操经验,海外华人指南",
  alternates: { canonical: "https://jueshi.net/guides" },
};

const CATEGORY_LABELS: Record<string, string> = {
  'all': '全部指南',
  '跨境寄送': '跨境寄送',
  '海外生活': '海外生活',
  '出海经营': '出海经营',
  'AI工具': 'AI工具',
};

const CATEGORY_COLORS: Record<string, string> = {
  '跨境寄送': 'bg-blue-100 text-blue-700',
  '海外生活': 'bg-green-100 text-green-700',
  '出海经营': 'bg-purple-100 text-purple-700',
  'AI工具': 'bg-violet-100 text-violet-700',
  'default': 'bg-gray-100 text-gray-700',
};

function estimateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.length / 500));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function getArticles(category: string | null) {
  const where: any = { status: 'published' };
  if (category && category !== 'all') where.category = category;

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, excerpt: true, content: true,
      category: true, updatedAt: true, views: true, relatedTools: true,
    },
  });

  const categoryCounts = await prisma.article.groupBy({
    by: ['category'],
    where: { status: 'published' },
    _count: { id: true },
  });

  return { articles, categoryCounts };
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const cat = params?.category || 'all';
  const { articles, categoryCounts } = await getArticles(cat === 'all' ? null : cat);

  // Featured articles for recommendation cards
  const featuredTools = articles.filter(a => a.relatedTools && a.relatedTools.length > 0).slice(0, 3);
  const recentArticles = articles.slice(0, 3);
  const allCategoryCounts = await prisma.article.groupBy({
    by: ['category'],
    where: { status: 'published' },
    _count: { id: true },
  });

  const categoryList = [
    { key: 'all', label: `全部 (${articles.length + (cat === 'all' ? 0 : 0)})` },
    { key: '跨境寄送', label: `跨境寄送 (${allCategoryCounts.find(c => c.category === '跨境寄送')?._count.id || 0})` },
    { key: '海外生活', label: `海外生活 (${allCategoryCounts.find(c => c.category === '海外生活')?._count.id || 0})` },
    { key: '出海经营', label: `出海经营 (${allCategoryCounts.find(c => c.category === '出海经营')?._count.id || 0})` },
    { key: 'AI工具', label: `AI工具 (${allCategoryCounts.find(c => c.category === 'AI工具')?._count.id || 0})` },
  ];

  return (
    <JueshiV4PublicShell>
      <PublicCategoryPageFrame
        title="海外实用指南"
        description="面向出海商家、海外华人、留学生的工具教程、避坑指南与实操经验"
      >
        {/* Category Filter */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex flex-wrap gap-2">
              {categoryList.map(c => (
                <Link
                  key={c.key}
                  href={c.key === 'all' ? '/guides' : `/guides?category=${encodeURIComponent(c.key)}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    cat === c.key
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scene Entry Cards - 使用 Design System */}
        <ContentSection className="max-w-6xl mx-auto px-4">
          <SectionHeader
            title="推荐阅读"
            description="精选热门指南，快速上手"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/guides" className="bg-white border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 text-xl">🌱</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">新手先看</h3>
              <p className="text-sm text-gray-500 mt-1">刚出海的第一份指南：从物流、收款到建站</p>
            </Link>
            <Link href="/guides" className="bg-white border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 text-xl">🧰</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">热门工具教程</h3>
              <p className="text-sm text-gray-500 mt-1">运费估算、发票生成、敏感货参考等实操指南</p>
            </Link>
            <Link href="/guides" className="bg-white border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3 text-xl">🛡️</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">出海/海外避坑</h3>
              <p className="text-sm text-gray-500 mt-1">跨境合规、物流陷阱、平台规则变化提醒</p>
            </Link>
          </div>
        </ContentSection>

        {/* Article Cards - 使用 Design System */}
        <ContentSection className="max-w-6xl mx-auto px-4 pb-16">
          <SectionHeader title={CATEGORY_LABELS[cat] || '全部指南'} />

          {articles.length === 0 ? (
            <div className="bg-white border rounded-xl p-12 text-center">
              <FileText className="w-14 h-14 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500 mb-1">暂无该分类文章</p>
              <p className="text-sm text-gray-400 mb-4">该分类内容正在整理中</p>
              <Link href="/guides" className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 min-h-[48px]">
                查看全部指南
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map(a => (
                <Link
                  key={a.slug}
                  href={`/guides/${a.slug}`}
                  className="bg-white border rounded-xl p-5 hover:shadow-md transition-all group block"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[a.category || 'default'] || CATEGORY_COLORS.default}`}>
                      {a.category || '未分类'}
                    </span>
                    {a.views > 100 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">热门</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 line-clamp-2 mb-2">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{a.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(a.updatedAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{estimateReadingTime(a.content)} min</span>
                    </div>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {articles.length > 0 && (
            <div className="mt-8 text-center">
              <PageCTA
                title="需要更多资源？"
                description="查看我们的资源库，获取更多出海工具和指南"
                actions={
                  <Link href="/resources" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-teal-300 transition-colors min-h-[48px]">
                    <BookOpen className="w-4 h-4" /> 查看资源库 →
                  </Link>
                }
                lightBackground
              />
            </div>
          )}
        </ContentSection>
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
  );
}

export const dynamic = 'force-dynamic';
