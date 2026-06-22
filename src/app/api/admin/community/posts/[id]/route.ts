import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { adjustHonor, incrementCommunityStat } from "@/lib/honor-helpers";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authRes = await requireAdmin();
    if (authRes instanceof NextResponse) return authRes;
    const { session } = authRes;
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const post = await prisma.forumPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "帖子不存在" }, { status: 404 });

    switch (action) {
      case "publish":
        await prisma.forumPost.update({ where: { id }, data: { status: "published" } });
        break;
      case "hide":
        await prisma.forumPost.update({ where: { id }, data: { status: "hidden" } });
        break;
      case "pin":
        await prisma.forumPost.update({ where: { id }, data: { isPinned: !post.isPinned } });
        break;
      case "feature": {
        // Toggle isFeatured. Only grant honor when newly featuring (防重复奖励).
        const willFeature = !post.isFeatured;
        await prisma.forumPost.update({
          where: { id },
          data: { isFeatured: willFeature, status: "published" },
        });
        if (willFeature) {
          await adjustHonor(post.userId, 20, "帖子被加精", "post_featured", post.id, session.user.id).catch(() => {});
          await incrementCommunityStat(post.userId, "featuredPostCount").catch(() => {});
        }
        break;
      }
      case "lock":
        await prisma.forumPost.update({ where: { id }, data: { isLocked: !post.isLocked } });
        break;
      default:
        return NextResponse.json({ error: "无效操作" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Post Moderate Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
