/**
 * Quote Sheet Page
 * 
 * Server wrapper that passes draftId to the Client component.
 */

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QuoteSheetClient from "./quote-sheet-client";

export default function QuoteSheetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-gray-500">加载中...</span></div>}>
      <QuoteSheetPageInner />
    </Suspense>
  );
}

function QuoteSheetPageInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") ?? null;
  return <QuoteSheetClient draftId={draftId} />;
}
