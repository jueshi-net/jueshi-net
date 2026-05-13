import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /sitemap.xml - 动态生成站点地图
// 降级策略：DB不可用时只输出静态核心路由
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let articles: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string; updatedAt: Date }[] = [];

  try {
    articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    });
    categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });
  } catch (e) {
    console.warn('sitemap.xml: DB unavailable, outputting static routes only:', e);
  }

  // 静态页面
  const staticPages = [
    '', '/search', '/tools', '/shipping', '/business', '/guides', '/nav', '/tracking',
    '/resources', '/favorites', '/help', '/privacy', '/terms', '/changelog',
    '/tools/qrcode', '/tools/exchange-rate',
    '/tools/container', '/tools/receipt', '/tools/invoice',
    '/tools/hs-code', '/tools/sensitive-goods', '/tools/address-formatter',
    '/tools/customs-generator', '/tools/shipping-calculator',
    '/tools/postal-code', '/tools/memo', '/tools/documents',
    '/tools/label-maker', '/tools/quote', '/tools/shipping-mark',
    '/tools/calculator', '/tools/shipping-estimator', '/tools/zip',
    '/tools/inbound',
    '/starter', '/starter/apps',
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
