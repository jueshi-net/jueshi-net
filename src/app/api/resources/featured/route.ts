import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/resources/featured
 * 获取前台推荐资源（公开 API）
 */
export async function GET() {
  try {
    const now = new Date();

    const featured = await prisma.resource.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        OR: [
          { featuredStartAt: null, featuredEndAt: null }, // 无时间限制
          { featuredStartAt: { lte: now }, featuredEndAt: null }, // 已开始，无结束
          { featuredStartAt: null, featuredEndAt: { gte: now } }, // 未开始，有结束
          { featuredStartAt: { lte: now }, featuredEndAt: { gte: now } }, // 在有效期内
        ],
      },
      orderBy: [{ featuredOrder: 'asc' }, { qualityScore: 'desc' }],
      take: 20,
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        category: true,
        tags: true,
        iconUrl: true,
        favicon: true,
        featuredGroup: true,
        featuredOrder: true,
      },
    });

    return NextResponse.json({ success: true, featured });
  } catch (error) {
    console.error('GET /api/resources/featured error:', error);
    return NextResponse.json({ error: '获取推荐资源失败' }, { status: 500 });
  }
}
