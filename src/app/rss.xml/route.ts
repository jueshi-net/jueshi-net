import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /rss.xml - 生成 RSS 2.0 feed
export async function GET() {
  const baseUrl = 'https://300zy.com';

  let articles: {
    title: string;
    slug: string;
    content: string;
    publishedAt: Date | null;
    createdAt: Date;
  }[] = [];

  try {
    articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: {
        title: true,
        slug: true,
        content: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
  } catch (e) {
    console.warn('rss.xml: DB unavailable, returning empty feed:', e);
  }

  function escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function toRfc822(date: Date): string {
    return date.toUTCString();
  }

  const itemsXml = articles
    .map((a) => {
      const link = `${baseUrl}/guides/${a.slug}`;
      const description = escapeXml(a.content.slice(0, 200));
      const pubDate = a.publishedAt ? toRfc822(a.publishedAt) : toRfc822(a.createdAt);
      const guid = `${baseUrl}/guides/${a.slug}`;

      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(guid)}</guid>
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>海外百宝箱</title>
    <link>${baseUrl}</link>
    <description>海外华人工具与资源平台</description>
    <language>zh-CN</language>${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
