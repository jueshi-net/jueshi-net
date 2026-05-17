import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SCENARIO_PACKAGES } from '@/data/scenario-packages';

export const dynamic = 'force-dynamic';

// GET /sitemap.xml - 动态生成站点地图
// 降级策略：DB不可用时只输出静态核心路由

// 资源分类 slug（稳定，手动维护）
const RESOURCE_SLUGS = [
  'starter', 'ai-tools', 'video-learning', 'overseas-life',
  'business-tools', 'security', 'browser-extensions',
  'life', 'logistics', 'business', 'templates',
];

// Starter 场景 slug（从静态数据读取）
const STARTER_SLUGS = SCENARIO_PACKAGES.map(p => `/starter/${p.slug}`);

export async function GET() {
  const baseUrl = 'https://jueshi.net';

  // 动态内容（DB查询失败时降级为空数组）
  let articles: { slug: string; updatedAt: Date }[] = [];
  let topics: { slug: string; updatedAt: Date }[] = [];
  let forumPosts: { slug: string; updatedAt: Date }[] = [];
  let forumCategories: { key: string }[] = [];

  try {
    articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (e) {
    console.warn('sitemap.xml: Article DB unavailable:', e);
  }

  try {
    topics = await prisma.topic.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (e) {
    console.warn('sitemap.xml: Topics DB unavailable:', e);
  }

  try {
    forumPosts = await prisma.forumPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  } catch (e) {
    console.warn('sitemap.xml: Forum posts DB unavailable:', e);
  }

  try {
    forumCategories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      select: { key: true },
    });
  } catch (e) {
    console.warn('sitemap.xml: Forum categories DB unavailable:', e);
  }

  // 静态公开页面
  const staticPages = [
    { path: '', priority: '1.0', changeFreq: 'daily' },
    { path: '/tools', priority: '0.9', changeFreq: 'weekly' },
    { path: '/tools/postal-code', priority: '0.9', changeFreq: 'monthly' },
    { path: '/tools/documents', priority: '0.9', changeFreq: 'monthly' },
    { path: '/tools/label-maker', priority: '0.9', changeFreq: 'monthly' },
    { path: '/ai-tools/product-copy', priority: '0.8', changeFreq: 'monthly' },
    { path: '/ai-tools/translate-polish', priority: '0.8', changeFreq: 'monthly' },
    { path: '/ai-tools/document-summary', priority: '0.8', changeFreq: 'monthly' },
    { path: '/starter', priority: '0.8', changeFreq: 'weekly' },
    ...STARTER_SLUGS.map(s => ({ path: s, priority: '0.7', changeFreq: 'monthly' as const })),
    { path: '/guides', priority: '0.8', changeFreq: 'weekly' },
    { path: '/resources', priority: '0.8', changeFreq: 'weekly' },
    ...RESOURCE_SLUGS.map(s => ({ path: `/resources/${s}`, priority: '0.7', changeFreq: 'weekly' as const })),
    { path: '/rankings', priority: '0.7', changeFreq: 'weekly' },
    { path: '/topics', priority: '0.8', changeFreq: 'weekly' },
    { path: '/pricing', priority: '0.6', changeFreq: 'monthly' },
    { path: '/help', priority: '0.5', changeFreq: 'monthly' },
    { path: '/terms', priority: '0.3', changeFreq: 'yearly' },
    { path: '/privacy', priority: '0.3', changeFreq: 'yearly' },
    { path: '/feedback', priority: '0.4', changeFreq: 'monthly' },
    // BBS 论坛
    { path: '/bbs', priority: '0.8', changeFreq: 'daily' },
    ...forumCategories.map(c => ({ path: `/bbs/category/${c.key}`, priority: '0.7', changeFreq: 'weekly' as const })),
  ];

  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changeFreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${articles.map(a => `  <url>
    <loc>${baseUrl}/guides/${a.slug}</loc>
    <lastmod>${new Date(a.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${topics.map(t => `  <url>
    <loc>${baseUrl}/topics/${t.slug}</loc>
    <lastmod>${new Date(t.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${forumPosts.map(p => `  <url>
    <loc>${baseUrl}/bbs/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
