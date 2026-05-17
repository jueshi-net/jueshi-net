// PATCH /api/admin/forum/posts/[id] — 管理帖子操作

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireAdmin();
  if (res instanceof NextResponse) return res;

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, isPinned, isLocked, categoryId, title, content } = body;

    const existing = await prisma.forumPost.findUnique({
      where: { id },
      select: { status: true, title: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    const data: any = {};

    if (status !== undefined) {
      const validStatuses = ["published", "pending", "hidden", "deleted"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status 必须是 ${validStatuses.join(", ")} 之一` },
          { status: 400 }
        );
      }
      data.status = status;
    }

    if (isPinned !== undefined) {
      if (typeof isPinned !== "boolean") {
        return NextResponse.json({ error: "isPinned 必须是布尔值" }, { status: 400 });
      }
      data.isPinned = isPinned;
    }

    if (isLocked !== undefined) {
      if (typeof isLocked !== "boolean") {
        return NextResponse.json({ error: "isLocked 必须是布尔值" }, { status: 400 });
      }
      data.isLocked = isLocked;
    }

    if (categoryId !== undefined) {
      if (typeof categoryId !== "string") {
        return NextResponse.json({ error: "categoryId 必须是字符串" }, { status: 400 });
      }
      const cat = await prisma.forumCategory.findUnique({
        where: { id: categoryId },
      });
      if (!cat || !cat.isActive) {
        return NextResponse.json({ error: "分类不存在或已禁用" }, { status: 400 });
      }
      data.categoryId = categoryId;
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 80) {
        return NextResponse.json(
          { error: "标题长度必须在 5-80 个字符之间" },
          { status: 400 }
        );
      }
      data.title = title.trim();
      data.slug = await generateUniqueSlug(title.trim());
    }

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim().length < 10 || content.trim().length > 3000) {
        return NextResponse.json(
          { error: "内容长度必须在 10-3000 个字符之间" },
          { status: 400 }
        );
      }
      data.content = content.trim();
      data.excerpt = content.trim().slice(0, 150);
    }

    const post = await prisma.forumPost.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, email: true } },
        category: true,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("[Admin Forum Post PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
