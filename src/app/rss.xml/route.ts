import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /rss.xml - RSS 订阅源
export async function GET() {
  const [articles, links] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    }),
    prisma.linkItem.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        createdAt: true,
      },
    }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const buildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>海外百宝箱 - 最新更新</title>
    <link>${siteUrl}</link>
    <description>海外华人的常用工具与资源平台 - 导航、查询、工具、CMS</description>
    <language>zh-CN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    
    ${articles.map(a => `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${siteUrl}/blog/${a.slug}</link>
      <guid>${siteUrl}/blog/${a.slug}</guid>
      <description>${escapeXml(a.excerpt || '')}</description>
      <pubDate>${a.publishedAt ? new Date(a.publishedAt).toUTCString() : buildDate}</pubDate>
    </item>`).join('')}
    
    ${links.map(l => `
    <item>
      <title>新链接: ${escapeXml(l.title)}</title>
      <link>${l.url}</link>
      <description>${escapeXml(l.description || '')}</description>
      <pubDate>${new Date(l.createdAt).toUTCString()}</pubDate>
    </item>`).join('')}
    
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
