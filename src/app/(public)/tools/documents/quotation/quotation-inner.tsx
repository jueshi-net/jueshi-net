/**
 * Client-side inner component for /tools/documents/quotation
 * Uses useSearchParams and imports the actual QuoteSheetClient.
 */

"use client";

import { useSearchParams } from "next/navigation";
import QuoteSheetClient from "../../quote-sheet/quote-sheet-client";

export default function QuotationPageInner() {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get("draftId") ?? null;
  return <QuoteSheetClient draftId={draftId} />;
}
