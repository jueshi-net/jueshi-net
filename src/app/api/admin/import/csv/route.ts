import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

// POST /api/admin/import/csv - 批量导入链接
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminRole((session.user as any).role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const body = await req.json();
  const { csv, categoryId, mode } = body;

  if (!csv) {
    return NextResponse.json({ error: '缺少CSV数据' }, { status: 400 });
  }

  // 解析 CSV
  const lines = csv.trim().split('\n');
  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV数据为空' }, { status: 400 });
  }

  const header = lines[0].toLowerCase();
  const hasCategory = header.includes('category') || header.includes('分类');
  const hasDescription = header.includes('description') || header.includes('描述') || header.includes('description');

  const results = { success: 0, skipped: 0, errors: [] as string[] };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 简单 CSV 解析 (处理引号)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const [name, url, desc, cat] = values;

    if (!name || !url) {
      results.errors.push(`第 ${i + 1} 行: 缺少名称或URL`);
      results.skipped++;
      continue;
    }

    try {
      // 检查 URL 是否已存在
      const existing = await prisma.linkItem.findFirst({ where: { url } });
      if (existing && mode !== 'overwrite') {
        results.skipped++;
        continue;
      }

      // 查找或创建分类
      let linkCategoryId = categoryId;
      if (cat) {
        const category = await prisma.category.upsert({
          where: { name: cat },
          create: { name: cat, slug: cat.toLowerCase(), sortOrder: 99 },
          update: {},
        });
        linkCategoryId = category.id;
      }

      if (existing && mode === 'overwrite') {
        await prisma.linkItem.update({
          where: { id: existing.id },
          data: {
            title: name,
            url,
            description: desc || existing.description,
            categoryId: linkCategoryId || existing.categoryId,
          },
        });
      } else {
        await prisma.linkItem.create({
          data: {
            title: name,
            url,
            description: desc || '',
            categoryId: linkCategoryId || null,
            status: 'active',
          },
        });
      }

      results.success++;
    } catch (error: any) {
      results.errors.push(`第 ${i + 1} 行: ${error.message}`);
      results.skipped++;
    }
  }

  return NextResponse.json(results);
}
