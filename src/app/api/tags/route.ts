import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

// GET /api/tags - 获取所有标签
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { links: true } } }
    });
    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

// POST /api/tags - 创建标签（管理员）
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: '名称不能为空' }, { status: 400 });
  }

  try {
    const tag = await prisma.tag.create({ data: { name } });
    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

// DELETE /api/tags - 删除标签
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });

  try {
    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
