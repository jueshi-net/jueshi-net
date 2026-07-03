import { Metadata } from 'next';
import { Suspense } from 'react';
import { getToolsData, CATEGORY_MAP } from '@/lib/tool-center';
import ToolFilterBar from '@/components/tools/tool-filter-bar';
import ToolGrid from '@/components/tools/tool-grid';
import Link from 'next/link';
import { FileText, ArrowRight, Wrench } from 'lucide-react';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q;
  
  const title = q ? `搜索 "${q}" - 工具中心` : '工具中心 - 绝世百宝箱';
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

// 高频工具 slug 列表，用于置顶显示
const PINNED_TOOL_SLUGS = [
  'postal-code',
  'hs-code',
  'exchange-rate',
  'commercial-invoice',
  'quote-sheet',
  'shipping-calculator',
  'container',
];

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params.q;
  const category = params.cat;
  const sort = params.sort || 'popular';

  const tools = await getToolsData(query, category, sort);

  // Compute which categories actually have tools (for hiding empty tabs)
  const presentCats = new Set(tools.map(t => t.category));
  const presentCategories = Array.from(presentCats);

  // 如果没有搜索词且没有分类过滤，将高频工具置顶
  const displayTools = (!query && !category) 
    ? [
        ...PINNED_TOOL_SLUGS
          .map(slug => tools.find(t => t.slug === slug))
          .filter((t): t is NonNullable<typeof t> => t !== undefined),
        ...tools.filter(t => !PINNED_TOOL_SLUGS.includes(t.slug))
      ]
    : tools;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Sticky Filter Bar */}
      <ToolFilterBar
        currentQuery={query}
        currentCategory={category}
        currentSort={sort}
        presentCategories={presentCategories}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Template Studio CTA Banner */}
        {!query && !category && (
          <div className="mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 shadow-lg" data-testid="tools-template-cta-banner">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-white mb-3">免费自定义你的单据模板</h2>
              <p className="text-lg text-white/90 mb-6">自由拖拽设计报价单、发票、装箱单、商品标签，支持批量打印与导出 PNG。免费注册，限时免费使用。</p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/tools/template-studio/canvas/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 text-base font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                  data-testid="tools-template-cta-create"
                >
                  <Wrench className="w-5 h-5" />
                  立即创建模板
                </Link>
                <Link
                  href="/workspace/templates"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white text-base font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors"
                  data-testid="tools-template-cta-my-templates"
                >
                  <FileText className="w-5 h-5" />
                  查看我的模板
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {query ? `搜索结果: "${query}"` : '工具中心'}
          </h1>
          <p className="text-gray-500 text-sm">
            {tools.length} 个工具可用 {query ? `(共找到 ${tools.length} 个匹配项)` : ''}
          </p>
          {/* Documents hub CTA — only on default view */}
          {!query && !category && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Link
                href="/tools/documents"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
              >
                <FileText className="w-3.5 h-3.5" />
                外贸单据模板中心
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/tools/template-studio"
                data-testid="tools-template-studio-card"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <Wrench className="w-3.5 h-3.5" />
                模板设计器
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/workspace/templates"
                data-testid="tools-my-templates-card"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors border border-green-200"
              >
                <FileText className="w-3.5 h-3.5" />
                我的模板
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        <Suspense fallback={<div className="text-center py-10">加载中...</div>}>
          {tools.length === 0 && query ? (
            <EmptySearchState query={query} />
          ) : tools.length === 0 && category && category !== 'all' ? (
            <EmptyCategoryState category={category} />
          ) : (
            <ToolGrid tools={displayTools} query={query} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

function EmptySearchState({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        没有找到与 &quot;{query}&quot; 相关的工具
      </h2>
      <p className="text-gray-500 mb-6">你可以试试以下热门工具：</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tools/postal-code" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          邮编查询
        </Link>
        <Link href="/tools/hs-code" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          HS 编码
        </Link>
        <Link href="/tools/exchange-rate" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          汇率换算
        </Link>
        <Link href="/tools/documents/quotation" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          报价单
        </Link>
        <Link href="/tools/shipping-calculator" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          运费计算
        </Link>
        <Link href="/tools/container" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          集装箱计算
        </Link>
      </div>
      <p className="mt-6 text-sm text-gray-400">
        也可以试试 <Link href="/tools/documents" className="text-purple-600 hover:underline">外贸单据模板中心</Link>
      </p>
    </div>
  );
}

function EmptyCategoryState({ category }: { category: string }) {
  const catName = CATEGORY_MAP[category] || category;
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        「{catName}」分类暂无工具
      </h2>
      <p className="text-gray-500 mb-6">该分类正在建设中，敬请期待。你也可以浏览其他分类：</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tools" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          全部工具
        </Link>
        <Link href="/tools?cat=documents" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          外贸单据
        </Link>
        <Link href="/tools?cat=logistics" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          物流工具
        </Link>
        <Link href="/tools?cat=general" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          编码查询
        </Link>
      </div>
    </div>
  );
}
