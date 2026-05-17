import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = 'https://jueshi.net';

  const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /settings
Disallow: /favorites
Disallow: /login
Disallow: /checkout
Disallow: /nav
Disallow: /register

Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl}`;

  return new NextResponse(robots, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
