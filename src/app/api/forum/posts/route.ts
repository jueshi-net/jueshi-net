// GET /api/forum/posts — 帖子列表
// POST /api/forum/posts — 创建帖子

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashIP(ip: string | null): string {
  if (!ip) return "";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "post";
  const slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  const existing = await prisma.forumPost.findUnique({ where: { slug } });
  if (!existing) return slug;
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function getIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10))
  );

  const where: any = { status: "published" };
  if (category) where.category = { key: category };
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
        category: true,
      },
    }),
    prisma.forumPost.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, pageSize });
}

export async function POST(req: Request) {
  const res = await requireAuth();
  if (res instanceof NextResponse) return res;

  const { session } = res;
  const userId = session.user.id;

  try {
    const body = await req.json();
    let { title, content, categoryId } = body;

    // Validate
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    title = title.trim();
    if (title.length < 5 || title.length > 80) {
      return NextResponse.json(
        { error: "标题长度必须在 5-80 个字符之间" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }
    content = content.trim();
    if (content.length < 10 || content.length > 3000) {
      return NextResponse.json(
        { error: "内容长度必须在 10-3000 个字符之间" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json({ error: "分类不能为空" }, { status: 400 });
    }

    // Verify category exists and is active
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category || !category.isActive) {
      return NextResponse.json({ error: "分类不存在或已禁用" }, { status: 400 });
    }

    // Rate limit: max 1 post per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentPost = await prisma.forumPost.findFirst({
      where: {
        userId,
        createdAt: { gte: oneMinuteAgo },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recentPost) {
      return NextResponse.json(
        { error: "发帖太频繁，请等待 1 分钟" },
        { status: 429 }
      );
    }

    // Duplicate content check: same title+content in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicatePost = await prisma.forumPost.findFirst({
      where: {
        userId,
        title,
        content,
        createdAt: { gte: oneDayAgo },
      },
    });
    if (duplicatePost) {
      return NextResponse.json(
        { error: "检测到重复内容，请勿重复发帖" },
        { status: 409 }
      );
    }

    // Daily limit: max 5 posts per user per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await prisma.forumPost.count({
      where: {
        userId,
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    if (todayCount >= 5) {
      return NextResponse.json(
        { error: "今日发帖数已达上限（5条）" },
        { status: 429 }
      );
    }

    // Determine status: admin users get published, others get pending
    const isAdmin = (session.user as any).role?.toUpperCase() === "ADMIN";
    const status = isAdmin ? "published" : "pending";

    // Generate slug and excerpt
    const slug = await generateUniqueSlug(title);
    const excerpt = content.slice(0, 150);

    const ip = getIp(req);
    const ua = req.headers.get("user-agent") || "";

    const post = await prisma.forumPost.create({
      data: {
        userId,
        categoryId,
        title,
        content,
        excerpt,
        slug,
        status,
        ipHash: hashIP(ip),
        userAgent: ua.slice(0, 200),
      },
      include: {
        user: { select: { name: true, email: true } },
        category: true,
      },
    });

    // v18.6.1: Update community stats + grant first_post badge (fire-and-forget)
    try {
      const { incrementCommunityStat, ensureCommunityStat } = await import("@/lib/honor-helpers");
      await ensureCommunityStat(userId);
      await incrementCommunityStat(userId, "postCount");
      // Grant first_post badge if this is user's first post
      const postCount = await prisma.forumPost.count({ where: { userId } });
      if (postCount === 1) {
        const badge = await prisma.userBadge.findUnique({ where: { key: "first_post" } });
        if (badge) {
          await prisma.userBadgeAward.upsert({
            where: { userId_badgeId: { userId, badgeId: badge.id } },
            create: { userId, badgeId: badge.id, reason: "首次发帖自动授予" },
            update: {},
          });
        }
      }
    } catch (e) {
      console.error("[CommunityStat post increment error]", e);
    }

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("[Forum Posts POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
