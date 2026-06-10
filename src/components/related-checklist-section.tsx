"use client";

import { useEffect, useState } from "react";
import { ListChecks, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface RelatedChecklistCard {
  slug: string;
  title: string;
  summary?: string;
  icon?: string;
}

interface Props {
  checklists?: RelatedChecklistCard[];
  /** If provided, fetches published checklists that reference this tool */
  toolSlug?: string;
  /** All published checklists will be shown (filtered by relevance if possible) */
  showAll?: boolean;
  sourcePath?: string;
}

export function RelatedChecklistSection({ checklists, toolSlug, showAll, sourcePath }: Props) {
  const [fetched, setFetched] = useState<RelatedChecklistCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toolSlug && !showAll) return;

    const abort = new AbortController();
    setLoading(true);

    (async () => {
      try {
        if (showAll) {
          const res = await fetch("/api/checklists", { signal: abort.signal });
          const json = await res.json();
          setFetched(json.data || []);
        } else if (toolSlug) {
          // Fetch all published checklists, then filter client-side
          const res = await fetch("/api/checklists", { signal: abort.signal });
          const json = await res.json();
          const all: RelatedChecklistCard[] = json.data || [];
          // TODO: Server-side filtering by toolSlug in the future
          // For now, show all published checklists (draft/hidden are excluded server-side)
          setFetched(all);
        }
      } catch {
        // Silently fail — checklist recommendation is non-critical
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    })();

    return () => abort.abort();
  }, [toolSlug, showAll]);

  // Use static checklists if provided (backwards compat), otherwise use fetched
  const display = checklists && checklists.length > 0 ? checklists : fetched;

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900 text-lg">📋 相关清单</h3>
        </div>
        <div className="text-sm text-gray-400">加载中...</div>
      </section>
    );
  }

  if (!display || display.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="w-5 h-5 text-teal-600" />
        <h3 className="font-semibold text-gray-900 text-lg">📋 相关清单</h3>
      </div>
      <div className="space-y-3">
        {display.map((cl) => (
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
