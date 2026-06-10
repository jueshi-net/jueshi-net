import { Metadata } from 'next';
import { Suspense } from 'react';
import { getToolsData, CATEGORY_MAP } from '@/lib/tool-center';
import ToolFilterBar from '@/components/tools/tool-filter-bar';
import ToolGrid from '@/components/tools/tool-grid';
import Link from 'next/link';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q;
  
  const title = q ? `搜索 "${q}" - 工具中心` : '工具中心 - 绝世百宝箱';
  const description = q 
    ? `查找与 ${q} 相关的出海工具。`
    : '海外华人常用工具箱：查包裹、算运费、做单据、查邮编、AI 文案，一个站搞定。';

  return {
    title,
    description,
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
  'quotation',
  'commercial-invoice',
  'shipping-calculator',
  'address-formatter',
];

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params.q;
  const category = params.cat;
  const sort = params.sort || 'popular';

  const tools = await getToolsData(query, category, sort);

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
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {query ? `搜索结果: "${query}"` : '工具中心'}
          </h1>
          <p className="text-gray-500 text-sm">
            {tools.length} 个工具可用 {query ? `(共找到 ${tools.length} 个匹配项)` : ''}
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-10">加载中...</div>}>
          {tools.length === 0 && query ? (
            <EmptySearchState query={query} />
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
        没有找到与 "{query}" 相关的工具
      </h2>
      <p className="text-gray-500 mb-6">你可以试试以下热门工具：</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/tools/postal-code" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          邮编查询
        </Link>
        <Link href="/tools/hs-code" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          HS编码
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
      </div>
    </div>
  );
}
