import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  const robots = `User-agent: *
Allow: /
Allow: /blog
Allow: /tools
Allow: /search

Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /settings
Disallow: /dashboard
Disallow: /my-links

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robots, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
