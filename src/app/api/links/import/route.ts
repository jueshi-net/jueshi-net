import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { ownedWorkspaces: true }
  });

  if (!user || !user.ownedWorkspaces.length) {
    return NextResponse.json({ error: '工作区不存在' }, { status: 404 });
  }

  const { links, categoryId } = await req.json();

  if (!Array.isArray(links) || links.length === 0) {
    return NextResponse.json({ error: '数据格式错误' }, { status: 400 });
  }

  if (links.length > 100) {
    return NextResponse.json({ error: '单次最多导入 100 条' }, { status: 400 });
  }

  const results = { success: 0, skipped: 0, errors: [] as string[] };

  for (const item of links) {
    try {
      if (!item.title || !item.url) {
        results.skipped++;
        continue;
      }

      await prisma.linkItem.create({
        data: {
          title: item.title,
          url: item.url,
          description: item.description || null,
          icon: item.icon || null,
          categoryId: categoryId || item.categoryId || null,
          workspaceId: user.ownedWorkspaces[0]?.id,
        }
      });
      results.success++;
    } catch (error: any) {
      results.errors.push(`${item.title || '未知'}: ${error.message}`);
    }
  }

  await auditLog({
    userId: user.id,
    action: 'import',
    entity: 'link',
    details: { total: links.length, success: results.success, skipped: results.skipped },
  });

  return NextResponse.json(results);
}

// GET /api/links/import/preview - 解析 CSV/JSON 预览
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const data = searchParams.get('data');
  const format = searchParams.get('format') || 'csv';

  if (!data) {
    return NextResponse.json({ error: '缺少数据' }, { status: 400 });
  }

  try {
    let parsed: any[] = [];

    if (format === 'json') {
      parsed = JSON.parse(data);
    } else if (format === 'csv') {
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        return NextResponse.json({ error: 'CSV 数据不足' }, { status: 400 });
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const titleIdx = headers.findIndex(h => /title|名称|标题/i.test(h));
      const urlIdx = headers.findIndex(h => /url|链接|网址/i.test(h));
      const descIdx = headers.findIndex(h => /desc|描述|简介/i.test(h));

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values[urlIdx]) {
          parsed.push({
            title: values[titleIdx] || values[urlIdx],
            url: values[urlIdx],
            description: values[descIdx] || ''
          });
        }
      }
    }

    return NextResponse.json({ parsed, count: parsed.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
