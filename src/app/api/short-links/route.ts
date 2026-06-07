import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/audit';
import crypto from 'crypto';

// POST /api/short-links - 创建短链
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const { targetUrl, code, linkId, expiresAt, password } = await req.json();

  if (!targetUrl) {
    return NextResponse.json({ error: '目标链接不能为空' }, { status: 400 });
  }

  const shortCode = code || crypto.randomBytes(4).toString('hex').slice(0, 6);

  const existing = await prisma.shortLink.findUnique({ where: { code: shortCode } });
  if (existing) {
    return NextResponse.json({ error: '短链码已被使用' }, { status: 409 });
  }

  const shortLink = await prisma.shortLink.create({
    data: {
      code: shortCode,
      url: targetUrl,
      userId: user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      password: password || null,
    }
  });

  await auditLog({
    userId: user.id,
    action: 'create',
    entity: 'shortlink',
    entityId: shortLink.id,
    details: { targetUrl, code: shortCode },
  });

  return NextResponse.json(shortLink, { status: 201 });
}

// GET /api/short-links - 获取当前用户的短链列表
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const [shortLinks, total] = await Promise.all([
    prisma.shortLink.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shortLink.count({ where: { userId: user.id } })
  ]);

  return NextResponse.json({ shortLinks, total, page, limit });
}

// DELETE /api/short-links/[id] - 删除短链
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
  }

  const shortLink = await prisma.shortLink.findUnique({ where: { id } });
  if (!shortLink || shortLink.userId !== user.id) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  await prisma.shortLink.delete({ where: { id } });

  await auditLog({
    userId: user.id,
    action: 'delete',
    entity: 'shortlink',
    entityId: id,
  });

  return NextResponse.json({ message: '已删除' });
}
