/**
 * /tools/quote → 307 redirect to /tools/documents/quotation
 * Handled by middleware.ts. This file is a fallback.
 */

import { redirect } from "next/navigation";

export default function QuoteRedirectPage() {
  redirect("/tools/documents/quotation");
}
