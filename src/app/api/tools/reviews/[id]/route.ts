// PATCH /api/tools/reviews/[id] — user edits their own review

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { validateRating, validateContent } from "@/lib/tool-reviews/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;
  const { id } = await params;

  try {
    const existing = await prisma.toolReview.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "短评不存在" }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "无权操作此短评" }, { status: 403 });
    }

    // Can edit pending/rejected; approved resets to pending
    if (existing.status === "hidden") {
      return NextResponse.json({ error: "隐藏的短评不能编辑" }, { status: 403 });
    }

    const body = await req.json();
    const { rating, content } = body;

    if (rating !== undefined) {
      const ratingResult = validateRating(rating);
      if (!ratingResult.valid) {
        return NextResponse.json({ error: ratingResult.error }, { status: 400 });
      }
    }

    if (content !== undefined) {
      const contentResult = validateContent(content);
      if (!contentResult.valid) {
        return NextResponse.json({ error: contentResult.error }, { status: 400 });
      }
    }

    // If approved, edit resets to pending
    const newStatus = existing.status === "approved" ? "pending" : existing.status;

    const review = await prisma.toolReview.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating: rating as number }),
        ...(content !== undefined && { content: content.trim() }),
        status: newStatus,
      },
    });

    return NextResponse.json({ review: { id: review.id, status: review.status } });
  } catch (error) {
    console.error("[Review PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
