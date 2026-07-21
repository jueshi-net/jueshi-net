/**
 * Middleware for canonical redirects and feature-flag HTTP 404.
 *
 * When FEATURE_SERVICE_PROVIDER is off, service-provider public routes
 * return a real HTTP 404 at the request boundary - before any rendering,
 * streaming, or SessionProvider mount. This is the only way to guarantee
 * a true 404 status code (not a soft 404 via notFound() in a streaming
 * response).
 *
 * E2E/test fixture slugs (starting with "e2e-") are also blocked here
 * as defense-in-depth, complementing the application-layer filter.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Service-provider public routes that must 404 when the flag is off. */
const SP_PUBLIC_ROUTES = [
  "/service-providers",
  "/business/",
  "/professional/",
  "/services/",
];

function isServiceProviderRoute(pathname: string): boolean {
  return SP_PUBLIC_ROUTES.some(
    (route) =>
      pathname === route.replace(/\/$/, "") || pathname.startsWith(route)
  );
}

function isFeatureOff(flagKey: string): boolean {
  const envValue = process.env[flagKey];
  // env not set = default off (deny-by-default, same as isFeatureEnabled)
  if (envValue === undefined) return true;
  return envValue !== "true" && envValue !== "1";
}

/** Return a real HTTP 404 response with the app's not-found HTML. */
function notFoundResponse(): NextResponse {
  const notFoundHtml = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex,nofollow"/><title>404 - 页面未找到 | 绝世百宝箱</title><style>body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.container{text-align:center;padding:2rem}.code{font-size:4rem;font-weight:700;color:#94a3b8;line-height:1}.msg{margin-top:.5rem;font-size:1.125rem;color:#64748b}a{display:inline-block;margin-top:1.5rem;padding:.5rem 1.5rem;background:#2563eb;color:#fff;border-radius:.5rem;text-decoration:none;font-size:.875rem}</style></head><body><div class="container"><div class="code">404</div><div class="msg">页面未找到</div><a href="/">返回首页</a></div></body></html>`;
  return new NextResponse(notFoundHtml, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /tools/quote -> /tools/documents/quotation (permanent)
  if (pathname === "/tools/quote") {
    const url = request.nextUrl.clone();
    url.pathname = "/tools/documents/quotation";
    return NextResponse.redirect(url, 308);
  }

  // /tools/quote-sheet -> /tools/documents/quotation (permanent)
  if (pathname === "/tools/quote-sheet") {
    const url = request.nextUrl.clone();
    url.pathname = "/tools/documents/quotation";
    return NextResponse.redirect(url, 308);
  }

  // /community -> /bbs (permanent, legacy path)
  if (pathname === "/community") {
    const url = request.nextUrl.clone();
    url.pathname = "/bbs";
    return NextResponse.redirect(url, 308);
  }

  // Feature-flag 404: service-provider routes when module is off.
  if (isServiceProviderRoute(pathname) && isFeatureOff("FEATURE_SERVICE_PROVIDER")) {
    return notFoundResponse();
  }

  // E2E/test fixture 404: service-provider detail routes with e2e- slugs
  // must NEVER be publicly accessible, even when the feature flag is on.
  // Defense-in-depth complementing the application-layer E2E filter.
  if (isServiceProviderRoute(pathname)) {
    const segments = pathname.split("/");
    const lastSegment = segments[segments.length - 1] ?? "";
    if (lastSegment.startsWith("e2e-")) {
      return notFoundResponse();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tools/quote",
    "/tools/quote-sheet",
    "/community",
    "/service-providers/:path*",
    "/business/:path*",
    "/professional/:path*",
    "/services/:path*",
  ],
};
