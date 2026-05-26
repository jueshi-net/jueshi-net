import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth/permissions';

// GET /api/admin/backup/export - 导出所有数据
export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminRole((session.user as any).role)) {
    return NextResponse.json({ error: '未授权' }, { status: 403 });
  }

  const [users, links, categories, articles, feedback, subscriptions, shortLinks] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.linkItem.findMany(),
    prisma.category.findMany(),
    prisma.article.findMany(),
    prisma.feedback.findMany(),
    prisma.emailSubscription.findMany(),
    prisma.shortLink.findMany(),
  ]);

  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    counts: {
      users: users.length,
      links: links.length,
      categories: categories.length,
      articles: articles.length,
      feedback: feedback.length,
      subscriptions: subscriptions.length,
      shortLinks: shortLinks.length,
    },
    data: {
      users,
      links,
      categories,
      articles,
      feedback,
      subscriptions,
      shortLinks,
    },
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="kjbxb-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
