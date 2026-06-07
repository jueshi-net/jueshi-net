/**
 * Quote Sheet Page — Server Wrapper
 *
 * Reads searchParams for draftId, wraps QuoteSheetClient in Suspense.
 */

import { Suspense } from "react";
import QuoteSheetClient from "./quote-sheet-client";
import { Loader2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ draftId?: string }>;
}

function QuoteSheetLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>加载中...</span>
      </div>
    </div>
  );
}

export default async function QuoteSheetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const draftId = params.draftId || null;

  return (
    <Suspense fallback={<QuoteSheetLoading />}>
      <QuoteSheetClient draftId={draftId} />
    </Suspense>
  );
}
