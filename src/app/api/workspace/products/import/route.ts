import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/workspace/products/import
 * 批量导入商品（CSV）
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { products, overwrite = false } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: '没有商品数据' }, { status: 400 });
    }

    if (products.length > 100) {
      return NextResponse.json({ error: '单次导入最多 100 条' }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const rowNum = i + 1;

      // 验证必填字段
      if (!item.name || !item.name.trim()) {
        results.failed++;
        results.errors.push(`第 ${rowNum} 行：商品名称不能为空`);
        continue;
      }

      // 检查 SKU 是否已存在（如果提供了 SKU）
      if (item.sku && item.sku.trim()) {
        const existing = await prisma.productItem.findFirst({
          where: {
            userId: session.user.id,
            sku: item.sku.trim(),
          },
        });

        if (existing) {
          if (overwrite) {
            // 更新已有商品
            await prisma.productItem.update({
              where: { id: existing.id },
              data: {
                name: item.name.trim(),
                description: item.description?.trim() || null,
                hsCode: item.hsCode?.trim() || null,
                unit: item.unit || 'PCS',
                unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
                currency: item.currency || 'USD',
                netWeight: item.netWeight ? parseFloat(item.netWeight) : null,
                grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
                length: item.length ? parseFloat(item.length) : null,
                width: item.width ? parseFloat(item.width) : null,
                height: item.height ? parseFloat(item.height) : null,
                originCountry: item.originCountry?.trim() || null,
                material: item.material?.trim() || null,
                usage: item.usage?.trim() || null,
              },
            });
            results.success++;
          } else {
            results.skipped++;
          }
          continue;
        }
      }

      // 创建新商品
      try {
        await prisma.productItem.create({
          data: {
            userId: session.user.id,
            name: item.name.trim(),
            sku: item.sku?.trim() || null,
            description: item.description?.trim() || null,
            hsCode: item.hsCode?.trim() || null,
            unit: item.unit || 'PCS',
            unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
            currency: item.currency || 'USD',
            netWeight: item.netWeight ? parseFloat(item.netWeight) : null,
            grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
            length: item.length ? parseFloat(item.length) : null,
            width: item.width ? parseFloat(item.width) : null,
            height: item.height ? parseFloat(item.height) : null,
            originCountry: item.originCountry?.trim() || null,
            material: item.material?.trim() || null,
            usage: item.usage?.trim() || null,
          },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`第 ${rowNum} 行：创建失败 - ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('POST /api/workspace/products/import error:', error);
    return NextResponse.json({ error: '导入失败' }, { status: 500 });
  }
}
