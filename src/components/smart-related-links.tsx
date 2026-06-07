/**
 * Smart Contextual Interlinking Component
 *
 * Renders a sidebar/bottom panel of contextually relevant links.
 * Usage:
 *   <SmartRelatedLinks tool="exchange-rate" country="US" />
 *   <SmartRelatedLinks tags={["美国", "留学"]} scenario="student" />
 */

import Link from 'next/link';
import { generateRelatedLinks, type RelatedLink } from '@/lib/smart-links';

interface SmartRelatedLinksProps {
  tags?: string[];
  country?: string;
  tool?: string;
  scenario?: string;
  type?: 'tool' | 'article' | 'destination';
  layout?: 'sidebar' | 'bottom';
  className?: string;
}

export default function SmartRelatedLinks({
  tags,
  country,
  tool,
  scenario,
  type = 'tool',
  layout = 'sidebar',
  className = '',
}: SmartRelatedLinksProps) {
  const links = generateRelatedLinks({ tags, country, tool, scenario, type });

  if (links.length === 0) return null;

  if (layout === 'sidebar') {
    return (
      <aside className={`bg-white border rounded-xl p-5 ${className}`}>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-lg">🔗</span> 相关推荐
        </h3>
        <div className="space-y-2">
          {links.map((link, i) => (
            <Link
              key={i}
              href={link.url}
              className="block p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors group"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg shrink-0 mt-0.5">{link.icon}</span>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-gray-900 group-hover:text-teal-700 truncate">
                    {link.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {link.description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  // Bottom layout (for article/tool pages without sidebar)
  return (
    <section className={`bg-white border rounded-xl p-5 md:p-6 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-lg">🔗</span> 你可能还需要
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link, i) => (
          <Link
            key={i}
            href={link.url}
            className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors group"
          >
            <span className="text-xl shrink-0">{link.icon}</span>
            <div className="min-w-0">
              <div className="font-medium text-sm text-gray-900 group-hover:text-teal-700">
                {link.title}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {link.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
