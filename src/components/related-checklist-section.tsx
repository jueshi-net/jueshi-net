"use client";

import { ListChecks, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface RelatedChecklistCard {
  slug: string;
  title: string;
  summary?: string;
  icon?: string;
}

interface Props {
  checklists: RelatedChecklistCard[];
  sourcePath?: string;
}

export function RelatedChecklistSection({ checklists, sourcePath }: Props) {
  if (!checklists || checklists.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="w-5 h-5 text-teal-600" />
        <h3 className="font-semibold text-gray-900 text-lg">📋 相关清单</h3>
      </div>
      <div className="space-y-3">
        {checklists.map((cl) => (
          <a
            key={cl.slug}
            href={`/checklists/${cl.slug}`}
            className="block p-4 bg-white rounded-lg border border-teal-100 hover:border-teal-300 hover:shadow-sm transition-all"
            onClick={() => {
              trackEvent.checklistInternalLinkClick(sourcePath || "tool", cl.slug);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  {cl.icon && <span className="text-lg">{cl.icon}</span>}
                  {cl.title}
                </div>
                {cl.summary && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cl.summary}</p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-teal-500 flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
