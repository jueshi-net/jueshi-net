import Link from 'next/link';
import { getCategoryInfo } from '@/lib/resources/category-config';
import { getCategoryBadgeClass } from './types';
import type { ResourceItem } from './types';
import ResourceLogo from './ResourceLogo';

interface ResourceCompactCardProps {
  resource: ResourceItem;
  showDate?: boolean;
}

/**
 * Compact card for sidebars — logo, name, optional category badge and date.
 */
export function ResourceCompactCard({ resource, showDate = true }: ResourceCompactCardProps) {
  const logoSrc = resource.iconUrl || resource.favicon || null;
  const catInfo = getCategoryInfo(resource.category);

  return (
    <Link
      href={`/resources/site/${resource.id}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <ResourceLogo src={logoSrc} name={resource.name} size="sm" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 truncate block group-hover:text-brand transition-colors font-medium">
          {resource.name}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getCategoryBadgeClass(
              resource.category,
            )}`}
          >
            {catInfo.label}
          </span>
          {showDate && (
            <span className="text-xs text-gray-400">
              {new Date(resource.createdAt).toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ResourceCompactCard;
