// POST /api/admin/topics/[id]/items — add item
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, alias, rating, category, iconText, iconBg, iconFg, installPriority, description, analogy, suitableFor, beginnerAdvice, riskTip, officialUrl, isBeginnerFriendly, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "name 必填" }, { status: 400 });
    }

    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      return NextResponse.json({ success: false, error: "专题不存在" }, { status: 404 });
    }

    // Get max sortOrder if not provided
    const maxSort = await prisma.topicItem.aggregate({
      where: { topicId: id },
      _max: { sortOrder: true },
    });
    const order = sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;

    const item = await prisma.topicItem.create({
      data: {
        topicId: id, name, alias, rating, category, iconText, iconBg, iconFg,
        installPriority, description, analogy, suitableFor, beginnerAdvice,
        riskTip, officialUrl, isBeginnerFriendly: isBeginnerFriendly ?? false,
        sortOrder: order,
      },
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
