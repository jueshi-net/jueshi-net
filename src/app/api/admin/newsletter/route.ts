import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

// GET /api/admin/newsletter - 获取订阅者列表和广播历史
export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminRole((session.user as any).role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const [subscribers, broadcasts] = await Promise.all([
    prisma.emailSubscription.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, token: true, createdAt: true },
    }),
    prisma.newsletterBroadcast.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        subject: true,
        content: true,
        sentCount: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({ subscribers, broadcasts });
}

// POST /api/admin/newsletter - 创建并发送广播
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminRole((session.user as any).role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { subject, content, testEmail } = await req.json();

  if (!subject || !content) {
    return NextResponse.json({ error: '缺少主题或内容' }, { status: 400 });
  }

  const subscribers = await prisma.emailSubscription.findMany({
    where: { isActive: true },
    select: { id: true, email: true },
  });

  // 创建广播记录
  const broadcast = await prisma.newsletterBroadcast.create({
    data: {
      subject,
      content,
      status: testEmail ? 'draft' : 'sent',
      sentCount: testEmail ? 0 : subscribers.length,
    },
  });

  // 如果是测试邮件，只发送给测试邮箱
  if (testEmail) {
    return NextResponse.json({
      success: true,
      broadcast,
      message: `测试邮件已准备，请手动发送给 ${testEmail}`,
    });
  }

  // 实际发送逻辑（这里只是记录，真实环境需要接入邮件服务）
  return NextResponse.json({
    success: true,
    broadcast,
    sentTo: subscribers.length,
    emails: subscribers.map(s => s.email),
  });
}

// DELETE /api/admin/newsletter/[id] - 删除广播记录
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdminRole((session.user as any).role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '缺少ID' }, { status: 400 });
  }

  await prisma.newsletterBroadcast.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
