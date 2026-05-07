import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/admin/analytics - 获取系统分析数据
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const [
    totalUsers,
    totalLinks,
    activeLinks,
    totalCategories,
    totalArticles,
    publishedArticles,
    totalFeedback,
    resolvedFeedback,
    totalSubscriptions,
    activeSubscriptions,
    totalShortLinks,
    recentUsers,
    recentLinks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.linkItem.count(),
    prisma.linkItem.count({ where: { status: 'active' } }),
    prisma.category.count(),
    prisma.article.count(),
    prisma.article.count({ where: { status: 'published' } }),
    prisma.feedback.count(),
    prisma.feedback.count({ where: { status: 'resolved' } }),
    prisma.emailSubscription.count(),
    prisma.emailSubscription.count({ where: { confirmed: true } }),
    prisma.shortLink.count(),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.linkItem.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  // 热门分类
  const topCategories = await prisma.category.findMany({
    take: 10,
    orderBy: { links: { _count: 'desc' } },
    select: {
      id: true,
      name: true,
      icon: true,
      _count: { select: { links: true } },
    },
  });

  // 热门链接
  const topLinks = await prisma.linkItem.findMany({
    take: 10,
    orderBy: { clicks: 'desc' },
    where: { status: 'active' },
    select: {
      id: true,
      title: true,
      url: true,
      clicks: true,
      category: { select: { name: true } },
    },
  });

  return NextResponse.json({
    overview: {
      totalUsers,
      activeUsers: totalUsers,
      totalLinks,
      activeLinks,
      totalCategories,
      totalArticles,
      publishedArticles,
      totalFeedback,
      resolvedFeedback,
      totalSubscriptions,
      activeSubscriptions,
      totalShares: 0,
      totalShortLinks,
    },
    trends: {
      newUsersLast7Days: recentUsers,
      newLinksLast7Days: recentLinks,
    },
    topCategories: topCategories.map(c => ({
      ...c,
      _count: { linkItems: c._count.links },
    })),
    topLinks: topLinks.map(l => ({
      ...l,
      name: l.title,
    })),
  });
}
