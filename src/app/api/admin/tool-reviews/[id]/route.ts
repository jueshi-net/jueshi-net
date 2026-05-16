// PATCH /api/admin/tool-reviews/[id] — admin approve/reject/hide a review

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["approved", "rejected", "hidden"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status 必须是 ${VALID_STATUSES.join(", ")} 之一` },
        { status: 400 }
      );
    }

    const existing = await prisma.toolReview.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "短评不存在" }, { status: 404 });
    }

    const review = await prisma.toolReview.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ review: { id: review.id, status: review.status } });
  } catch (error) {
    console.error("[Admin Review PATCH Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
