import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  try {
    // 链接总点击数
    const totalClicks = await prisma.linkItem.aggregate({
      _sum: { clicks: true }
    });

    // 文章总阅读量
    const totalViews = await prisma.article.aggregate({
      _sum: { views: true }
    });

    // 总用户数
    const totalUsers = await prisma.user.count();

    // 总链接数
    const totalLinks = await prisma.linkItem.count();

    // 总文章数
    const totalArticles = await prisma.article.count({
      where: { status: 'PUBLISHED' }
    });

    // 总订阅数
    const totalSubs = await prisma.subscription.count({
      where: { isActive: true }
    });

    // 分类统计
    const categoryStats = await prisma.category.findMany({
      select: {
        name: true,
        _count: { select: { links: true } }
      },
      orderBy: { links: { _count: 'desc' } }
    });

    // 热门链接 Top 10
    const topLinks = await prisma.linkItem.findMany({
      select: {
        title: true,
        clicks: true,
        url: true
      },
      orderBy: { clicks: 'desc' },
      take: 10
    });

    return NextResponse.json({
      totalClicks: totalClicks._sum.clicks || 0,
      totalViews: totalViews._sum.views || 0,
      totalUsers,
      totalLinks,
      totalArticles,
      totalSubs,
      categories: categoryStats,
      topLinks
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
