import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/resources/quality-check
 * 资源质量检查（dry-run，只读）
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  try {
    const totalResources = await prisma.resource.count();

    // 缺分类
    const noCategory = await prisma.resource.count({
      where: { category: { equals: '' } },
    });

    // 缺标签
    const noTags = await prisma.resource.count({
      where: { tags: { isEmpty: true } },
    });

    // 缺 logo
    const noLogo = await prisma.resource.count({
      where: {
        iconUrl: null,
        favicon: null,
      },
    });

    // 缺描述
    const noDescription = await prisma.resource.count({
      where: {
        description: null,
      },
    });

    // inactive
    const inactive = await prisma.resource.count({
      where: { isActive: false },
    });

    // 低质量评分
    const lowQuality = await prisma.resource.count({
      where: {
        qualityScore: { lt: 60 },
      },
    });

    // 推荐资源
    const featured = await prisma.resource.count({
      where: { isFeatured: true },
    });

    // 按分类统计
    const byCategory = await prisma.resource.groupBy({
      by: ['category'],
      _count: true,
    });

    const report = {
      total: totalResources,
      issues: {
        noCategory,
        noTags,
        noLogo,
        noDescription,
        inactive,
        lowQuality,
      },
      featured,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      recommendations: [
        noLogo > 0 && `建议为 ${noLogo} 个资源添加 Logo`,
        noDescription > 0 && `建议为 ${noDescription} 个资源添加描述`,
        noTags > 0 && `建议为 ${noTags} 个资源添加标签`,
        lowQuality > 0 && `建议审查 ${lowQuality} 个低质量评分资源`,
        inactive > 0 && `建议清理 ${inactive} 个 inactive 资源`,
      ].filter(Boolean),
    };

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('GET /api/admin/resources/quality-check error:', error);
    return NextResponse.json({ error: '质量检查失败' }, { status: 500 });
  }
}
