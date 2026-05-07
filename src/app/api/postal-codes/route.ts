import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const country = searchParams.get('country') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (country) {
      where.country = country;
    }

    if (query) {
      where.OR = [
        { postalCode: { contains: query } },
        { city: { contains: query } },
        { province: { contains: query } },
        { district: { contains: query } },
        { areaName: { contains: query } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.postalCode.findMany({
        where,
        orderBy: [{ country: 'asc' }, { postalCode: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.postalCode.count({ where }),
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
    console.error('Postal code search error:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
