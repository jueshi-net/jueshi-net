/**
 * Middleware for canonical redirects.
 * Handles legacy path redirects for Quote Sheet.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /tools/quote → /tools/documents/quotation (permanent)
  if (pathname === "/tools/quote") {
    const url = request.nextUrl.clone();
    url.pathname = "/tools/documents/quotation";
    return NextResponse.redirect(url, 308);
  }

  // /tools/quote-sheet → /tools/documents/quotation (permanent)
  if (pathname === "/tools/quote-sheet") {
    const url = request.nextUrl.clone();
    url.pathname = "/tools/documents/quotation";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tools/quote", "/tools/quote-sheet"],
};
