/**
 * POST /api/webhooks/bbs-seed
 *
 * Accepts forum post + reply data from external AI workflows (n8n/Dify/etc.)
 * and writes them to the database using virtual BBS accounts.
 *
 * Auth: Bearer token via Authorization header (process.env.BBS_SEED_SECRET)
 *
 * Payload:
 * {
 *   "title": "加拿大海运双清包税，温哥华最近严查吗？",
 *   "content": "最近准备发一批带电产品去加拿大...",
 *   "categoryKey": "logistics",        // ForumCategory.key
 *   "tags": ["加拿大", "海运"],
 *   "replies": [
 *     { "content": "温哥华海关最近确实在查认证..." },
 *     { "content": "借楼问一下，时效大概多久？" }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ─── Slug utilities (mirrors /api/forum/posts logic) ───

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || 'post';
  let slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  let attempts = 0;
  while (attempts++ < 5) {
    const existing = await prisma.forumPost.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

// ─── Auth ───

function verifyAuth(req: NextRequest): boolean {
  const header = req.headers.get('authorization');
  if (!header) return false;
  const token = header.replace('Bearer ', '');
  const secret = process.env.BBS_SEED_SECRET;
  if (!secret) return false;
  return token === secret;
}

// ─── Random user picker ───

async function pickRandomUser(excludeUserId?: string): Promise<{ id: string; name: string } | null> {
  const users = await prisma.user.findMany({
    where: {
      email: { endsWith: '@bbs-local.test' },
      id: excludeUserId ? { not: excludeUserId } : undefined,
    },
    select: { id: true, name: true },
  });
  if (users.length === 0) return null;
  const picked = users[Math.floor(Math.random() * users.length)];
  return { id: picked.id, name: picked.name || '匿名用户' };
}

// ─── Request schema ───

interface SeedReply {
  content: string;
}

interface SeedPayload {
  title: string;
  content: string;
  categoryKey: string;
  tags?: string[];
  replies?: SeedReply[];
}

function validatePayload(body: unknown): SeedPayload | string {
  if (!body || typeof body !== 'object') return '无效请求体';
  const b = body as Record<string, unknown>;
  if (typeof b.title !== 'string' || b.title.trim().length < 2) return 'title 缺失或过短';
  if (typeof b.content !== 'string' || b.content.trim().length < 2) return 'content 缺失或过短';
  if (typeof b.categoryKey !== 'string' || !b.categoryKey.trim()) return 'categoryKey 缺失';
  if (b.replies && !Array.isArray(b.replies)) return 'replies 必须为数组';
  if (b.replies) {
    for (let i = 0; i < (b.replies as unknown[]).length; i++) {
      const r = (b.replies as unknown[])[i];
      if (!r || typeof r !== 'object' || typeof (r as Record<string, unknown>).content !== 'string')
        return `replies[${i}].content 无效`;
    }
  }
  return b as unknown as SeedPayload;
}

// ─── Handler ───

export async function POST(req: NextRequest) {
  // 1. Auth check
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: '未授权', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON 解析失败', code: 'BAD_REQUEST' }, { status: 400 });
  }

  const validation = validatePayload(body);
  if (typeof validation === 'string') {
    return NextResponse.json({ error: validation, code: 'VALIDATION_ERROR' }, { status: 400 });
  }
  const payload = validation;

  // 3. Find category by key
  const category = await prisma.forumCategory.findUnique({
    where: { key: payload.categoryKey.trim() },
  });
  if (!category) {
    return NextResponse.json(
      { error: `分类 "${payload.categoryKey}" 不存在`, code: 'CATEGORY_NOT_FOUND' },
      { status: 404 },
    );
  }
  if (!category.isActive) {
    return NextResponse.json(
      { error: `分类 "${category.name}" 已停用`, code: 'CATEGORY_INACTIVE' },
      { status: 400 },
    );
  }

  // 4. Pick random author
  const author = await pickRandomUser();
  if (!author) {
    return NextResponse.json(
      { error: '无可用虚拟账号，请先运行 prisma/seed-bbs-users.ts', code: 'NO_USERS' },
      { status: 500 },
    );
  }

  // 5. Generate slug
  const slug = await generateUniqueSlug(payload.title);

  // 6. Generate excerpt from content (strip HTML tags)
  const excerpt = payload.content
    .replace(/<[^>]*>/g, '')
    .slice(0, 200);

  // 7. Transaction: create post + comments
  const result = await prisma.$transaction(async (tx) => {
    // Create post
    const post = await tx.forumPost.create({
      data: {
        slug,
        userId: author.id,
        categoryId: category.id,
        title: payload.title.trim(),
        content: payload.content.trim(),
        excerpt,
        status: 'published',
        ipHash: crypto.createHash('sha256').update('webhook-seed').digest('hex').slice(0, 16),
        userAgent: 'BBS Seed Bot',
      },
      include: {
        user: { select: { name: true } },
        category: { select: { name: true, key: true } },
      },
    });

    // Create replies
    const replyResults: { id: string; userId: string; userName: string }[] = [];
    const replies = payload.replies || [];

    for (const reply of replies) {
      const replyAuthor = await pickRandomUser(author.id);
      if (!replyAuthor) continue;

      const comment = await tx.forumComment.create({
        data: {
          postId: post.id,
          userId: replyAuthor.id,
          content: reply.content.trim(),
          status: 'published',
          ipHash: crypto.createHash('sha256').update('webhook-seed').digest('hex').slice(0, 16),
          userAgent: 'BBS Seed Bot',
        },
        include: {
          user: { select: { name: true } },
        },
      });

      replyResults.push({
        id: comment.id,
        userId: replyAuthor.id,
        userName: replyAuthor.name || '',
      });
    }

    // Update post counters
    await tx.forumPost.update({
      where: { id: post.id },
      data: {
        commentCount: replyResults.length,
        lastCommentAt: replyResults.length > 0 ? new Date() : undefined,
      },
    });

    return { post, replies: replyResults };
  });

  // 8. Return success
  return NextResponse.json({
    success: true,
    post: {
      id: result.post.id,
      slug: result.post.slug,
      title: result.post.title,
      author: result.post.user.name,
      category: result.post.category.name,
      url: `/bbs/${result.post.slug}`,
    },
    replies: result.replies.map(r => ({
      id: r.id,
      author: r.userName,
    })),
    total: 1 + result.replies.length,
  }, { status: 201 });
}
