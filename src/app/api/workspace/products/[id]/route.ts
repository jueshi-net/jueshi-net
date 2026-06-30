import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/workspace/products/[id]
 * 获取单个商品详情
 */
export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const product = await prisma.productItem.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('GET /api/workspace/products/[id] error:', error);
    return NextResponse.json({ error: '获取商品失败' }, { status: 500 });
  }
}

/**
 * PATCH /api/workspace/products/[id]
 * 更新商品
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify ownership
    const existing = await prisma.productItem.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

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
      isActive,
    } = body;

    const product = await prisma.productItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(sku !== undefined && { sku: sku?.trim() || null }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(hsCode !== undefined && { hsCode: hsCode?.trim() || null }),
        ...(unit !== undefined && { unit: unit || 'PCS' }),
        ...(unitPrice !== undefined && { unitPrice: unitPrice ? parseFloat(unitPrice) : null }),
        ...(currency !== undefined && { currency: currency || 'USD' }),
        ...(netWeight !== undefined && { netWeight: netWeight ? parseFloat(netWeight) : null }),
        ...(grossWeight !== undefined && { grossWeight: grossWeight ? parseFloat(grossWeight) : null }),
        ...(length !== undefined && { length: length ? parseFloat(length) : null }),
        ...(width !== undefined && { width: width ? parseFloat(width) : null }),
        ...(height !== undefined && { height: height ? parseFloat(height) : null }),
        ...(originCountry !== undefined && { originCountry: originCountry?.trim() || null }),
        ...(material !== undefined && { material: material?.trim() || null }),
        ...(usage !== undefined && { usage: usage?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('PATCH /api/workspace/products/[id] error:', error);
    return NextResponse.json({ error: '更新商品失败' }, { status: 500 });
  }
}

/**
 * DELETE /api/workspace/products/[id]
 * 删除商品（软删除：设为 inactive）
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.productItem.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // Soft delete: set isActive = false
    await prisma.productItem.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/workspace/products/[id] error:', error);
    return NextResponse.json({ error: '删除商品失败' }, { status: 500 });
  }
}
