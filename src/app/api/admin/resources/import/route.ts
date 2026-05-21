/**
 * POST /api/admin/resources/import
 *
 * Batch import resources from crawler JSON output.
 * Admin-only endpoint.
 *
 * Request body:
 * {
 *   "resources": [
 *     { "name": "Amazon", "url": "https://www.amazon.com", "description": "...", "category": "business", "tags": ["电商"], "logoUrl": "..." },
 *     ...
 *   ],
 *   "createTopic": true,
 *   "topicName": "跨境电商导航资源合集"
 * }
 *
 * Response:
 * { "success": true, "imported": 45, "skipped": 3, "errors": [...], "topicId": "..." }
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  // ─── Admin guard ─────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
  }

  // ─── Parse body ──────────────────────────────────────────────────────
  let body: {
    resources: Array<{
      name: string;
      url: string;
      description?: string;
      category?: string;
      tags?: string[];
      logoUrl?: string;
      sourceType?: string;
      usage?: string;
      disclaimer?: string;
    }>;
    createTopic?: boolean;
    topicName?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '无效的 JSON 格式' }, { status: 400 });
  }

  const { resources, createTopic = false, topicName } = body;

  if (!Array.isArray(resources) || resources.length === 0) {
    return NextResponse.json(
      { error: 'resources 必须是包含至少一条数据的数组' },
      { status: 400 }
    );
  }

  // ─── Validate categories ─────────────────────────────────────────────
  const VALID_CATEGORIES = ['life', 'logistics', 'business', 'templates'];

  const imported: string[] = [];
  const skipped: Array<{ name: string; url: string; reason: string }> = [];
  const errors: Array<{ name: string; url: string; error: string }> = [];

  // ─── Step 1: Bulk upsert resources ───────────────────────────────────
  // Since Resource.url is not unique, we use findFirst + update/create pattern
  // For efficiency, first collect all existing URLs in one query
  const existingUrls = new Map<string, { id: string; name: string }>();
  const allUrls = resources.map(r => r.url.trim());

  const existing = await prisma.resource.findMany({
    where: { url: { in: allUrls } },
    select: { id: true, url: true, name: true },
  });

  for (const r of existing) {
    existingUrls.set(r.url, { id: r.id, name: r.name });
  }

  for (const [idx, res] of resources.entries()) {
    const name = (res.name || '').trim();
    const url = (res.url || '').trim();

    if (!name || !url) {
      errors.push({ name: name || '(empty)', url, error: 'name 和 url 不能为空' });
      continue;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      errors.push({ name, url, error: '无效的 URL 格式' });
      continue;
    }

    const category = VALID_CATEGORIES.includes(res.category || '')
      ? res.category!
      : 'life';
    const tags = Array.isArray(res.tags) ? res.tags : [category];
    const sourceType = res.sourceType || 'third-party';

    try {
      if (existingUrls.has(url)) {
        // Update existing resource
        const existing = existingUrls.get(url)!;
        await prisma.resource.update({
          where: { id: existing.id },
          data: {
            name,
            description: res.description || null,
            category,
            tags,
            sourceType,
            usage: res.usage || null,
            disclaimer: res.disclaimer || null,
            isActive: true,
            updatedAt: new Date(),
          },
        });
        imported.push(`updated:${name}`);
      } else {
        // Create new resource
        await prisma.resource.create({
          data: {
            name,
            url,
            description: res.description || null,
            category,
            tags,
            sourceType,
            usage: res.usage || null,
            disclaimer: res.disclaimer || null,
            isActive: true,
            sortOrder: idx,
          },
        });
        imported.push(`created:${name}`);
      }
    } catch (err: any) {
      errors.push({ name, url, error: err.message });
    }
  }

  // ─── Step 2 (optional): Auto-generate Topic + TopicItems ─────────────
  let topicId: string | null = null;

  if (createTopic && topicName) {
    try {
      // Generate a slug from topicName
      const slugBase = topicName
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
      const slug = `${slugBase}-${Date.now()}`;

      const topic = await prisma.topic.create({
        data: {
          slug,
          title: topicName,
          subtitle: `自动生成的资源合集，共 ${imported.length} 个工具/网站`,
          summary: `本合集收录了 ${imported.length} 个跨境电商相关工具与网站，涵盖物流、生活、商业等多个分类。由系统自动导入，等待管理员复核后发布。`,
          status: 'draft', // 草稿状态，等待复核
          templateType: 'rating_list',
          coverEmoji: '🛒',
          tags: ['自动导入', '资源合集'],
          suitableFor: ['跨境电商', '出海卖家'],
        },
      });

      topicId = topic.id;

      // Create TopicItems for each imported resource
      const itemsData = imported
        .map((entry, i) => {
          const name = entry.replace(/^(created|updated):/, '');
          const matchedResource = resources.find(
            r => (r.name || '').trim() === name
          );
          if (!matchedResource) return null;

          return {
            topicId: topic.id,
            name,
            officialUrl: (matchedResource.url || '').trim(),
            description: matchedResource.description || '',
            category: matchedResource.category || 'life',
            rating: null,
            iconText: name.slice(0, 2).toUpperCase(),
            isBeginnerFriendly: false,
            sortOrder: i,
          };
        })
        .filter(Boolean);

      if (itemsData.length > 0) {
        await prisma.topicItem.createMany({
          data: itemsData,
        });
      }

      // Add an intro section
      await prisma.topicSection.create({
        data: {
          topicId: topic.id,
          type: 'intro',
          title: '合集说明',
          content: `本合集由系统自动从导航网站导入，共收录 ${imported.length} 个资源。管理员可在后台编辑、评级（S/A/B/C/D）并发布。`,
          sortOrder: 0,
        },
      });
    } catch (err: any) {
      errors.push({
        name: '(topic)',
        url: '',
        error: `创建专题失败: ${err.message}`,
      });
    }
  }

  // ─── Response ────────────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    imported: imported.length,
    skipped: skipped.length,
    errors: errors.slice(0, 50), // Cap at 50 errors
    topicId,
    details: {
      created: imported.filter(e => e.startsWith('created:')).length,
      updated: imported.filter(e => e.startsWith('updated:')).length,
    },
  });
}
