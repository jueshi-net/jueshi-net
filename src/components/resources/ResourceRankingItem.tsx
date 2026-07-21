import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import type { ResourceItem } from './types';

interface ResourceRankingItemProps {
  resource: ResourceItem;
  rank: number;
}

const rankBadgeClasses = [
  'bg-red-100 text-red-600', // #1
  'bg-orange-100 text-orange-600', // #2
  'bg-amber-100 text-amber-600', // #3
  'bg-gray-100 text-gray-500', // rest
];

/**
 * Numbered ranking item for hot-list sidebars.
 * Top-3 get coloured rank badges; the rest are muted.
 */
export function ResourceRankingItem({ resource, rank }: ResourceRankingItemProps) {
  const badgeClass = rankBadgeClasses[Math.min(rank - 1, rankBadgeClasses.length - 1)];

  return (
    <Link
      href={`/resources/site/${resource.id}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div
        className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${badgeClass}`}
      >
        {rank}
      </div>
      <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-brand transition-colors font-medium">
        {resource.name}
      </span>
      {resource.qualityScore > 0 && (
        <span className="shrink-0 inline-flex items-center gap-0.5 text-xs text-amber-500">
          <TrendingUp className="w-3 h-3" />
          {resource.qualityScore}
        </span>
      )}
    </Link>
  );
}

export default ResourceRankingItem;
