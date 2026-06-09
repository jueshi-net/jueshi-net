/**
 * /tools/quote-sheet → 307 redirect to canonical /tools/documents/quotation
 * Legacy path kept for bookmark compatibility. Handled by middleware.ts.
 * This file is a fallback.
 */

import { redirect } from "next/navigation";

export default function QuoteSheetRedirect() {
  redirect("/tools/documents/quotation");
}
