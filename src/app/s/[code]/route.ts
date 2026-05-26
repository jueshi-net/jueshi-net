import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: '缺少短链码' }, { status: 400 });
  }

  const shortLink = await prisma.shortLink.findUnique({
    where: { code }
  });

  if (!shortLink) {
    return NextResponse.json({ error: '短链不存在' }, { status: 404 });
  }

  if (!shortLink.isActive) {
    return NextResponse.json({ error: '短链已禁用' }, { status: 410 });
  }

  if (shortLink.expiresAt && shortLink.expiresAt < new Date()) {
    return NextResponse.json({ error: '短链已过期' }, { status: 410 });
  }

  // Increment clicks
  await prisma.shortLink.update({
    where: { id: shortLink.id },
    data: { clicks: { increment: 1 } }
  });

  return NextResponse.redirect(shortLink.url, 302);
}
