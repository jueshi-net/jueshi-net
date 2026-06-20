import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * GET /api/workspace/products/template
 * 下载商品导入 CSV 模板
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const headers = [
    'name',
    'sku',
    'description',
    'hsCode',
    'unit',
    'unitPrice',
    'currency',
    'netWeight',
    'grossWeight',
    'length',
    'width',
    'height',
    'originCountry',
    'material',
    'usage',
  ];

  const exampleRow = [
    '不锈钢保温杯',
    'BT-500ML',
    '500ml 双层真空保温杯',
    '9617000000',
    'PCS',
    '15.50',
    'USD',
    '0.35',
    '0.40',
    '25',
    '8',
    '8',
    'China',
    '304 Stainless Steel',
    'Drinkware',
  ];

  const csv = [headers.join(','), exampleRow.join(',')].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="product-import-template.csv"',
    },
  });
}
