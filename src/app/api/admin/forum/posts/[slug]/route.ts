// PUT /api/admin/forum/posts/[slug] — Approve/reject/lock/pin posts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;

  const userRole = (session.user as any).role?.toUpperCase();
  if (userRole !== "ADMIN") {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const { slug } = await params;
    const body = await req.json();
    const { action } = body; // approve, reject, lock, unlock, pin, unpin

    const post = await prisma.forumPost.findUnique({ where: { slug } });
    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    let updateData: any = {};
    let eventAction = "";

    switch (action) {
      case "approve":
        updateData.status = "published";
        eventAction = "forum_post_approve";
        break;
      case "reject":
        updateData.status = "hidden";
        eventAction = "forum_post_reject";
        break;
      case "lock":
        updateData.isLocked = true;
        eventAction = "forum_post_lock";
        break;
      case "unlock":
        updateData.isLocked = false;
        eventAction = "forum_post_unlock";
        break;
      case "pin":
        updateData.isPinned = true;
        eventAction = "forum_post_pin";
        break;
      case "unpin":
        updateData.isPinned = false;
        eventAction = "forum_post_unpin";
        break;
      default:
        return NextResponse.json({ error: "无效操作" }, { status: 400 });
    }

    const updatedPost = await prisma.forumPost.update({
      where: { slug },
      data: updateData,
    });

    // Log event (non-blocking)
    try {
      await prisma.eventLog.create({
        data: {
          eventType: "forum_admin",
          action: eventAction,
          toolName: slug,
        },
      });
    } catch (logError) {
      console.error("[Forum Event Log Error]", logError);
    }

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("[Admin Forum Post Action Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
