import { Metadata } from 'next';
import { Suspense } from 'react';
import { getToolsData, CATEGORY_MAP } from '@/lib/tool-center';
import ToolFilterBar from '@/components/tools/tool-filter-bar';
import ToolGrid from '@/components/tools/tool-grid';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const q = params.q;
  
  const title = q ? `搜索 "${q}" - 工具中心` : '工具中心 - 海外百宝箱';
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

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params.q;
  const category = params.cat;
  const sort = params.sort || 'popular';

  const tools = await getToolsData(query, category, sort);

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
          <ToolGrid tools={tools} query={query} />
        </Suspense>
      </div>
    </div>
  );
}
