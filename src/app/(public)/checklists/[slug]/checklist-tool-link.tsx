"use client";

import { trackEvent } from "@/lib/analytics";

interface Props {
  slug: string;
  toolSlug: string;
  name: string;
}

export function ChecklistToolLink({ slug, toolSlug, name }: Props) {
  return (
    <a
      href={`/tools/${toolSlug}`}
      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
      onClick={() => {
        trackEvent.checklistToolClick(slug, toolSlug);
      }}
    >
      <span className="font-medium text-teal-700">{name}</span>
      <div className="text-xs text-gray-500 mt-1">/tools/{toolSlug} →</div>
    </a>
  );
}
