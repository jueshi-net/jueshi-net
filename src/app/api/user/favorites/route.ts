import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const favorites = await prisma.userFavorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const body = await req.json();
  const { resourceType, resourceUrl, title } = body;
  if (!resourceUrl || !title) {
    return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
  }
  try {
    const fav = await prisma.userFavorite.create({
      data: { userId: session.user.id, resourceType: resourceType || 'tool', resourceUrl, title },
    });
    return NextResponse.json(fav);
  } catch (e: any) {
    if (e.code === 'P2002') return NextResponse.json({ error: '已收藏' }, { status: 409 });
    return NextResponse.json({ error: '收藏失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const url = new URL(req.url);
  const resourceUrl = url.searchParams.get('resourceUrl');
  if (!resourceUrl) return NextResponse.json({ error: '缺少 resourceUrl' }, { status: 400 });
  await prisma.userFavorite.deleteMany({ where: { userId: session.user.id, resourceUrl } });
  return NextResponse.json({ ok: true });
}
