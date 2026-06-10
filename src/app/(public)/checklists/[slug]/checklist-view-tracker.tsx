"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function ChecklistViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent.checklistView(slug);
  }, [slug]);
  return null;
}
