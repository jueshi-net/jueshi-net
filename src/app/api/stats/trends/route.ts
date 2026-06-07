import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '7d';

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get all links with click data
  const links = await prisma.linkItem.findMany({
    where: { updatedAt: { gte: startDate } },
    select: { clicks: true, updatedAt: true, createdAt: true }
  });

  // Get articles with view data
  const articles = await prisma.article.findMany({
    where: { publishedAt: { gte: startDate } },
    select: { views: true, publishedAt: true }
  });

  // Generate trend data
  const days: { date: string; clicks: number; views: number; newLinks: number }[] = [];
  const dayCount = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const unit = period === '24h' ? 'hour' : 'day';

  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * (unit === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    const dateStr = unit === 'hour'
      ? `${d.getHours()}:00`
      : `${d.getMonth() + 1}/${d.getDate()}`;

    days.push({ date: dateStr, clicks: 0, views: 0, newLinks: 0 });
  }

  // Calculate totals
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

  // Category breakdown
  const categoryStats = await prisma.category.findMany({
    select: {
      name: true,
      _count: { select: { links: true } }
    },
    orderBy: { links: { _count: 'desc' } },
    take: 8
  });

  // Recent activity
  const recentLinks = await prisma.linkItem.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { title: true, createdAt: true, clicks: true }
  });

  const recentArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    take: 5,
    orderBy: { publishedAt: 'desc' },
    select: { title: true, publishedAt: true, views: true }
  });

  return NextResponse.json({
    period,
    days,
    totalClicks,
    totalViews,
    totalLinks: links.length,
    totalArticles: articles.length,
    categories: categoryStats,
    recentLinks,
    recentArticles,
  });
}
