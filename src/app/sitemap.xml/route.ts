import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /sitemap.xml - 动态生成站点地图
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 获取所有文章
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  });

  // 获取所有分类
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  // 静态页面
  const staticPages = [
    '', '/search', '/tools', '/shipping', '/business', '/guides', '/nav', '/tracking',
    '/resources', '/favorites', '/help', '/privacy', '/terms', '/changelog',
    '/tools/calculator', '/tools/qrcode', '/tools/exchange-rate',
    '/tools/container', '/tools/receipt', '/tools/invoice',
    '/tools/qrcode', '/tools/exchange-rate',
    '/tools/hs-code', '/tools/sensitive-goods', '/tools/address-formatter',
    '/tools/customs-generator', '/tools/shipping-calculator',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(path => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${path === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '' ? '1.0' : path.startsWith('/tools') ? '0.8' : '0.7'}</priority>
  </url>`).join('')}
  
  ${articles.map(a => `
  <url>
    <loc>${baseUrl}/blog/${a.slug}</loc>
    <lastmod>${new Date(a.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  
  ${categories.map(c => `
  <url>
    <loc>${baseUrl}/search?category=${c.slug}</loc>
    <lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
