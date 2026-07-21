import Link from 'next/link';
import { ExternalLink, Star, TrendingUp, BookOpen } from 'lucide-react';
import { getCategoryInfo } from '@/lib/resources/category-config';
import { getCategoryBadgeClass } from './types';
import type { ResourceItem } from './types';
import ResourceLogo from './ResourceLogo';
import FavoriteButton from '@/components/favorite-button';

interface ResourceCardProps {
  resource: ResourceItem;
}

/**
 * Full resource card for the main grid.
 * Shows logo, name, description, category badge, tags, quality score,
 * featured badge, favorite button, detail link, and external visit link.
 */
export function ResourceCard({ resource }: ResourceCardProps) {
  const logoSrc = resource.iconUrl || resource.favicon || null;
  const catInfo = getCategoryInfo(resource.category);

  return (
    <div className="group relative bg-white rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover hover:border-brand/30 transition-all duration-200 flex flex-col">
      {/* Featured badge */}
      {resource.isFeatured && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          <Star className="w-3 h-3" />
          精选
        </span>
      )}

      {/* Ad badge */}
      {resource.isAd && (
        <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          广告
        </span>
      )}

      {/* Header: logo + name + badges */}
      <div className="flex items-start gap-4 mb-3">
        <ResourceLogo src={logoSrc} name={resource.name} size="md" />
        <div className="flex-1 min-w-0 pr-12">
          <h3 className="text-base font-bold text-title group-hover:text-brand truncate transition-colors mb-1.5">
            {resource.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getCategoryBadgeClass(
                resource.category,
              )}`}
            >
              {catInfo.label}
            </span>
            {resource.qualityScore > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                {resource.qualityScore}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-sm text-subtitle line-clamp-2 mb-3 leading-relaxed flex-1">
          {resource.description}
        </p>
      )}

      {/* Tags */}
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {resource.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-gray-50 text-gray-500 border border-border-light"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border-light mt-auto">
        <FavoriteButton
          resourceUrl={resource.url}
          title={resource.name}
          resourceType="url"
          size="sm"
        />
        <Link
          href={`/resources/site/${resource.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 hover:bg-brand/5 hover:text-brand border border-border hover:border-brand/20 transition-colors"
          title="查看详情"
        >
          <BookOpen className="w-4 h-4" />
          <span>详情</span>
        </Link>
        <a
          href={resource.url}
          target={resource.url.startsWith('http') ? '_blank' : undefined}
          rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand/5 text-brand hover:bg-brand hover:text-white border border-brand/20 hover:border-brand transition-colors ml-auto"
          title="访问网站"
        >
          <ExternalLink className="w-4 h-4" />
          <span>访问</span>
        </a>
      </div>
    </div>
  );
}

export default ResourceCard;
