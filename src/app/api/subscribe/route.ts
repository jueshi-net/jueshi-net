import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/subscribe - 邮件订阅
export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
  }

  try {
    // 检查是否已订阅
    const existing = await prisma.emailSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json({ error: '您已订阅', status: 'subscribed' });
      }
      // 重新发送确认邮件（这里简化处理）
      return NextResponse.json({ message: '请检查邮箱确认订阅', status: 'pending' });
    }

    // 创建订阅记录
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 小时有效

    await prisma.emailSubscription.create({
      data: {
        email,
        token,
        expiresAt,
        confirmed: false,
      },
    });

    return NextResponse.json({
      message: '订阅成功！请检查邮箱完成确认',
      status: 'pending',
    });
  } catch {
    return NextResponse.json({ error: '订阅失败，请稍后重试' }, { status: 500 });
  }
}

// GET /api/subscribe/confirm - 确认订阅
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: '缺少确认令牌' }, { status: 400 });
  }

  const sub = await prisma.emailSubscription.findFirst({
    where: { token },
  });

  if (!sub) {
    return NextResponse.json({ error: '无效的确认令牌' }, { status: 404 });
  }

  if (sub.confirmed) {
    return NextResponse.json({ message: '您已确认订阅', status: 'confirmed' });
  }

  if (sub.expiresAt && sub.expiresAt < new Date()) {
    return NextResponse.json({ error: '确认令牌已过期' }, { status: 400 });
  }

  await prisma.emailSubscription.update({
    where: { id: sub.id },
    data: {
      confirmed: true,
      confirmedAt: new Date(),
    },
  });

  return NextResponse.json({ message: '订阅确认成功！', status: 'confirmed' });
}

// DELETE /api/subscribe - 取消订阅
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: '缺少邮箱' }, { status: 400 });
  }

  await prisma.emailSubscription.deleteMany({
    where: { email },
  });

  return NextResponse.json({ message: '已取消订阅' });
}
