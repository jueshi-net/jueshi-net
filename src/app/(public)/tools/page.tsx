import { Metadata } from 'next';
import { Suspense } from 'react';
import { getToolsData, CATEGORY_MAP } from '@/lib/tool-center';
import ToolFilterBar from '@/components/tools/tool-filter-bar';
import ToolGrid from '@/components/tools/tool-grid';
import Link from 'next/link';
import { FileText, ArrowRight, BookOpen, Wrench } from 'lucide-react';
import JueshiV4PublicShell from '@/components/layout/JueshiV4PublicShell';
import { PublicCategoryPageFrame } from '@/components/templates/public/PublicCategoryPageFrame';
import { PageContainer, PageHero, BreadcrumbBar, ContentSection, SectionHeader, PageCTA } from '@/components/design-system';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q;
  
  const title = q ? `搜索 \"${q}\" - 工具中心` : '工具中心 - 绝世百宝箱';
  const description = q 
    ? `查找与 ${q} 相关的出海工具。`
    : '外贸单据、跨境物流、邮编汇率、HS 编码，一站式实用工具箱。';

  return {
    title,
    description,
    keywords: "工具中心,跨境工具,外贸工具,海外华人工具,实用工具,在线工具,免费工具,跨境电商工具,物流工具,单据工具",
    alternates: { canonical: "https://jueshi.net/tools" },
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

// Six quick tools — must be accurate
const PINNED_TOOL_SLUGS = [
  'postal-code',
  'hs-code',
  'exchange-rate',
  'address-formatter',
  'shipping-calculator',
  'tracking',
];

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params.q;
  const category = params.cat;
  const sort = params.sort || 'popular';

  const tools = await getToolsData(query, category, sort);

  // Compute which categories actually have tools
  const presentCats = new Set(tools.map(t => t.category));
  const presentCategories = Array.from(presentCats);

  // Quick tools: pinned + rest
  const displayTools = (!query && !category) 
    ? [
        ...PINNED_TOOL_SLUGS
          .map(slug => tools.find(t => t.slug === slug))
          .filter((t): t is NonNullable<typeof t> => t !== undefined),
        ...tools.filter(t => !PINNED_TOOL_SLUGS.includes(t.slug))
      ]
    : tools;

  const breadcrumbs = [
    { title: '首页', href: '/' },
    { title: '工具中心' },
  ];

  return (
    <JueshiV4PublicShell>
      <PublicCategoryPageFrame
        title="🔧 工具中心"
        description="外贸单据、跨境物流、邮编汇率、HS 编码，一站式实用工具箱"
        icon={<Wrench className="w-6 h-6" />}
      >
        <div className="space-y-8">
          {/* Filter Bar — matches /guides style */}
          <Suspense fallback={null}>
            <ToolFilterBar
              currentQuery={query}
              currentCategory={category}
              presentCategories={presentCategories}
            />
          </Suspense>

          {/* Quick Tools */}
          {!query && !category && (
            <ContentSection>
              <SectionHeader
                title="常用工具"
                description="高频使用工具，快速入口"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayTools.slice(0, 6).map(tool => (
                  <Link
                    key={tool.slug}
                    href={tool.route || '/tools'}
                    className="bg-white border rounded-xl p-5 hover:shadow-md transition-all group block"
                  >
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 line-clamp-1 mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{tool.description || '暂无描述'}</p>
                    <div className="flex items-center gap-1 mt-3 text-sm text-teal-600">
                      立即使用 <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </ContentSection>
          )}

          {/* All Tools */}
          <ContentSection>
            <SectionHeader title={query ? '搜索结果' : (category && category !== 'all' ? (CATEGORY_MAP[category] || category) : '全部工具')} />

            <Suspense fallback={<div className="text-center py-10">加载中...</div>}>
              {tools.length === 0 && query ? (
                <EmptySearchState query={query} />
              ) : tools.length === 0 && category && category !== 'all' ? (
                <EmptyCategoryState category={category} />
              ) : (
                <ToolGrid tools={displayTools} query={query} />
              )}
            </Suspense>

            {/* CTA — uses standard PageCTA */}
            {!query && !category && (
              <div className="mt-8">
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
        </div>
      </PublicCategoryPageFrame>
    </JueshiV4PublicShell>
  );
}

function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <FileText className="w-14 h-14 mx-auto mb-4 text-gray-300" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        没有找到与 &quot;{query}&quot; 相关的工具
      </h2>
      <p className="text-gray-500 mb-6">你可以试试其他关键词：</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tools/postal-code" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all">
          邮编查询
        </Link>
        <Link href="/tools/hs-code" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all">
          HS 编码
        </Link>
        <Link href="/tools/exchange-rate" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all">
          汇率换算
        </Link>
        <Link href="/tools/shipping-calculator" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all">
          运费计算
        </Link>
      </div>
    </div>
  );
}

function EmptyCategoryState({ category }: { category: string }) {
  const catName = CATEGORY_MAP[category] || category;
  return (
    <div className="text-center py-16">
      <FileText className="w-14 h-14 mx-auto mb-4 text-gray-300" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        「{catName}」分类暂无工具
      </h2>
      <p className="text-gray-500 mb-6">该分类正在建设中，你也可以浏览其他分类：</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tools" className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
          全部工具
        </Link>
        <Link href="/tools?cat=documents" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all">
          外贸单据
        </Link>
        <Link href="/tools?cat=logistics" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all">
          物流工具
        </Link>
      </div>
    </div>
  );
}