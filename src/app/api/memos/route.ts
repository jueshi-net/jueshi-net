import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireLogin, getUserLimits } from '@/lib/auth/permissions';

// GET /api/memos - 获取用户备忘录
export async function GET() {
  const res = await requireLogin();
  if ('error' in res) return res.error;

  const memos = await prisma.memo.findMany({
    where: { userId: res.session.user.id },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ memos });
}

// POST /api/memos - 创建备忘录
export async function POST(req: Request) {
  const res = await requireLogin();
  if ('error' in res) return res.error;

  const { title, content, category, color, dueDate } = await req.json();

  if (!title) {
    return NextResponse.json({ error: '缺少标题' }, { status: 400 });
  }

  // Check memo limit
  const limits = getUserLimits(res.role as any);
  if (limits.maxMemos > 0) {
    const count = await prisma.memo.count({ where: { userId: res.session.user.id } });
    if (count >= limits.maxMemos) {
      return NextResponse.json({ error: `备忘录数量已达上限 (${limits.maxMemos})` }, { status: 403 });
    }
  }

  const memo = await prisma.memo.create({
    data: {
      userId: res.session.user.id,
      title,
      content: content || '',
      category: category || '',
      color: color || '',
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json({ success: true, memo });
}

// PATCH /api/memos - 更新备忘录
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
  }

  const body = await req.json();

  const memo = await prisma.memo.update({
    where: { id, userId: session.user.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
    },
  });

  return NextResponse.json({ success: true, memo });
}

// DELETE /api/memos - 删除备忘录
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
  }

  await prisma.memo.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
