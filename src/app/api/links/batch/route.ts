import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

// POST /api/links/batch - 批量操作
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // Get user's workspace
  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });

  if (!workspace) {
    return NextResponse.json({ error: '工作区不存在' }, { status: 404 });
  }

  const workspaceId = workspace.id;

  const { action, ids, data } = await req.json();

  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  if (ids.length > 50) {
    return NextResponse.json({ error: '单次最多操作 50 条' }, { status: 400 });
  }

  let result: any;

  switch (action) {
    case 'delete':
      result = await prisma.linkItem.deleteMany({
        where: { id: { in: ids }, workspaceId }
      });
      await auditLog({
        userId: user.id,
        action: 'delete',
        entity: 'link',
        details: { batch: true, count: ids.length },
      });
      break;

    case 'update-category':
      result = await prisma.linkItem.updateMany({
        where: { id: { in: ids }, workspaceId },
        data: { categoryId: data.categoryId || null }
      });
      break;

    case 'update-sort':
      // Update sort order based on provided order
      const updates = ids.map((id: string, index: number) =>
        prisma.linkItem.update({
          where: { id },
          data: { sortOrder: data.startOrder + index }
        })
      );
      await Promise.all(updates);
      result = { count: ids.length };
      break;

    case 'toggle-favorite':
      const userId = session.user.id as string;
      for (const linkId of ids) {
        const existing = await prisma.favorite.findUnique({
          where: { userId_linkId: { userId, linkId } }
        });
        if (existing) {
          await prisma.favorite.delete({ where: { id: existing.id } });
        } else {
          await prisma.favorite.create({ data: { userId, linkId } });
        }
      }
      result = { count: ids.length };
      break;

    default:
      return NextResponse.json({ error: '未知操作' }, { status: 400 });
  }

  return NextResponse.json(result);
}
