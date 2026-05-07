import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/memos - 获取用户备忘录
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const memos = await prisma.memo.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ memos });
}

// POST /api/memos - 创建备忘录
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { title, content, category, color } = await req.json();

  if (!title) {
    return NextResponse.json({ error: '缺少标题' }, { status: 400 });
  }

  const memo = await prisma.memo.create({
    data: {
      userId: session.user.id,
      title,
      content: content || '',
      category: category || '',
      color: color || '',
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
