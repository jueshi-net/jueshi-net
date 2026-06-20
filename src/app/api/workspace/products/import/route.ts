import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Sanitize CSV cell to prevent formula injection
 * Removes leading =, +, -, @, \t, \r characters
 */
function sanitizeCsvCell(value: string): string {
  if (!value) return value;
  // Remove characters that can trigger formula execution in spreadsheet apps
  return value.replace(/^[=+\-@\t\r]+/, '').trim();
}

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

      // Sanitize all string fields to prevent CSV formula injection
      const sanitizedName = sanitizeCsvCell(item.name || '');
      const sanitizedSku = sanitizeCsvCell(item.sku || '');
      const sanitizedDescription = sanitizeCsvCell(item.description || '');
      const sanitizedHsCode = sanitizeCsvCell(item.hsCode || '');
      const sanitizedOriginCountry = sanitizeCsvCell(item.originCountry || '');
      const sanitizedMaterial = sanitizeCsvCell(item.material || '');
      const sanitizedUsage = sanitizeCsvCell(item.usage || '');

      // 验证必填字段
      if (!sanitizedName || !sanitizedName.trim()) {
        results.failed++;
        results.errors.push(`第 ${rowNum} 行：商品名称不能为空`);
        continue;
      }

      // 检查 SKU 是否已存在（如果提供了 SKU）
      if (sanitizedSku && sanitizedSku.trim()) {
        const existing = await prisma.productItem.findFirst({
          where: {
            userId: session.user.id,
            sku: sanitizedSku.trim(),
          },
        });

        if (existing) {
          if (overwrite) {
            // 更新已有商品
            await prisma.productItem.update({
              where: { id: existing.id },
              data: {
                name: sanitizedName,
                description: sanitizedDescription || null,
                hsCode: sanitizedHsCode || null,
                unit: item.unit || 'PCS',
                unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
                currency: item.currency || 'USD',
                netWeight: item.netWeight ? parseFloat(item.netWeight) : null,
                grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
                length: item.length ? parseFloat(item.length) : null,
                width: item.width ? parseFloat(item.width) : null,
                height: item.height ? parseFloat(item.height) : null,
                originCountry: sanitizedOriginCountry || null,
                material: sanitizedMaterial || null,
                usage: sanitizedUsage || null,
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
            name: sanitizedName,
            sku: sanitizedSku || null,
            description: sanitizedDescription || null,
            hsCode: sanitizedHsCode || null,
            unit: item.unit || 'PCS',
            unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
            currency: item.currency || 'USD',
            netWeight: item.netWeight ? parseFloat(item.netWeight) : null,
            grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
            length: item.length ? parseFloat(item.length) : null,
            width: item.width ? parseFloat(item.width) : null,
            height: item.height ? parseFloat(item.height) : null,
            originCountry: sanitizedOriginCountry || null,
            material: sanitizedMaterial || null,
            usage: sanitizedUsage || null,
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
