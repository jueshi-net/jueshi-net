import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workspace/products
 * 获取当前用户的商品列表
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const isActive = searchParams.get('isActive');

  try {
    const where: any = { userId: session.user.id };
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { hsCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.productItem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('GET /api/workspace/products error:', error);
    return NextResponse.json({ error: '获取商品列表失败' }, { status: 500 });
  }
}

/**
 * POST /api/workspace/products
 * 创建新商品
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      sku,
      description,
      hsCode,
      unit,
      unitPrice,
      currency,
      netWeight,
      grossWeight,
      length,
      width,
      height,
      originCountry,
      material,
      usage,
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: '商品名称不能为空' }, { status: 400 });
    }

    const product = await prisma.productItem.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        sku: sku?.trim() || null,
        description: description?.trim() || null,
        hsCode: hsCode?.trim() || null,
        unit: unit || 'PCS',
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        currency: currency || 'USD',
        netWeight: netWeight ? parseFloat(netWeight) : null,
        grossWeight: grossWeight ? parseFloat(grossWeight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        originCountry: originCountry?.trim() || null,
        material: material?.trim() || null,
        usage: usage?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('POST /api/workspace/products error:', error);
    return NextResponse.json({ error: '创建商品失败' }, { status: 500 });
  }
}
