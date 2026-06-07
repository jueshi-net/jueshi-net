import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats/clicks - 获取链接点击统计
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '7');
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // 获取近期点击最多的链接
  const topClicked = await prisma.linkItem.findMany({
    where: {
      status: 'active',
      updatedAt: { gte: startDate },
    },
    orderBy: { clicks: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      url: true,
      clicks: true,
      category: { select: { name: true } },
    },
  });

  // 总点击数
  const totalClicks = await prisma.linkItem.aggregate({
    _sum: { clicks: true },
  });

  // 分类点击分布
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { links: true } },
    },
    orderBy: { links: { _count: 'desc' } },
    take: 8,
  });

  return NextResponse.json({
    totalClicks: totalClicks._sum.clicks || 0,
    topClicked,
    categories: categories.map(c => ({
      name: c.name,
      count: c._count.links,
    })),
  });
}
