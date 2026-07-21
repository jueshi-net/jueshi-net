import Link from 'next/link';
import { LayoutGrid, Tag } from 'lucide-react';
import { getCategoryInfo } from '@/lib/resources/category-config';
import { getCategoryTextClass } from './types';
import type { CategoryCount } from './types';

interface ResourceCategoryNavProps {
  categories: CategoryCount[];
  activeCategory: string;
  totalCount: number;
}

/**
 * Category navigation sidebar with counts.
 * Each item is a real `<Link>` so navigation is crawlable and works
 * without client-side JS.
 */
export function ResourceCategoryNav({
  categories,
  activeCategory,
  totalCount,
}: ResourceCategoryNavProps) {
  // Sort by count desc for display order.
  const sorted = [...categories].sort((a, b) => b.count - a.count);

  const itemClass = (active: boolean) =>
    `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
      active ? 'bg-brand/5 text-brand font-semibold' : 'text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-light">
        <Tag className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-bold text-title">资源分类</h3>
      </div>

      <div className="space-y-1">
        <Link
          href="/resources"
          className={itemClass(activeCategory === 'all')}
          aria-current={activeCategory === 'all' ? 'page' : undefined}
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            全部资源
          </span>
          <span className="text-xs text-gray-400">{totalCount}</span>
        </Link>

        {sorted.map((cat) => {
          const info = getCategoryInfo(cat.id);
          const active = activeCategory === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/resources?category=${cat.id}`}
              className={itemClass(active)}
              aria-current={active ? 'page' : undefined}
            >
              <span className={active ? '' : getCategoryTextClass(cat.id)}>{info.label}</span>
              <span className="text-xs text-gray-400">{cat.count}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default ResourceCategoryNav;
