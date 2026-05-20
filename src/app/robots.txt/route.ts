import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo';

export async function GET() {
  const content = `User-agent: *
Allow: /
Allow: /tools
Allow: /tracking
Allow: /bbs
Allow: /topics
Allow: /guides
Allow: /packages
Allow: /ai-tools
Allow: /starter
Disallow: /dashboard
Disallow: /my-links
Disallow: /settings
Disallow: /admin
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /api/
Disallow: /preview/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
  });
}
