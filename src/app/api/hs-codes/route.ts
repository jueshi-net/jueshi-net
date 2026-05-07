import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (query) {
      where.OR = [
        { code: { contains: query } },
        { description: { contains: query } },
        { descriptionEn: { contains: query } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.hSCode.findMany({
        where,
        orderBy: [{ code: 'asc' }],
        skip,
        take: limit,
        include: {
          parent: { select: { code: true, description: true } },
          _count: { select: { children: true } },
        },
      }),
      prisma.hSCode.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('HS code search error:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
