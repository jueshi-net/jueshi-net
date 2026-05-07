import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/feedback - 获取反馈列表（管理员）
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const feedbacks = await prisma.feedback.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return NextResponse.json({ feedbacks });
}

// POST /api/feedback - 提交反馈
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const { type, subject, content, url } = await req.json();

  if (!content) {
    return NextResponse.json({ error: '反馈内容不能为空' }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: user.id,
      type: type || 'suggestion',
      subject: subject || content.slice(0, 50),
      content,
      page: url || null,
    }
  });

  return NextResponse.json(feedback, { status: 201 });
}

// PATCH /api/feedback/[id] - 更新反馈状态
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const { status } = await req.json();

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
  }

  await prisma.feedback.update({
    where: { id },
    data: { status, updatedAt: new Date() }
  });

  return NextResponse.json({ message: '已更新' });
}
