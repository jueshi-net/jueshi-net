import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { createHmac, randomBytes } from 'node:crypto';

// GET /api/webhooks - 列出所有 webhook
export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const webhooks = await prisma.webhook.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(webhooks);
}

// POST /api/webhooks - 创建 webhook
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { url, events, secret } = await req.json();

  if (!url || !url.startsWith('http')) {
    return NextResponse.json({ error: 'URL 格式不正确' }, { status: 400 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      url,
      events: events || ['link.created', 'article.published'],
      secret: secret || randomBytes(32).toString('hex'),
      isActive: true
    }
  });

  return NextResponse.json(webhook, { status: 201 });
}

// DELETE /api/webhooks/[id] - 删除 webhook
export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
  }

  await prisma.webhook.delete({ where: { id } });

  return NextResponse.json({ message: '已删除' });
}

// PATCH /api/webhooks - 更新 webhook 状态
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少 ID' }, { status: 400 });
  }

  const { isActive } = await req.json();

  const webhook = await prisma.webhook.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json(webhook);
}
