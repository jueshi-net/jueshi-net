// DELETE /api/admin/users/[id]/badges/[awardId] — remove badge award
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; awardId: string }> }) {
  const res = await requireAdmin();
  if ("error" in res) return res.error;
  try {
    const { awardId } = await params;
    const existing = await prisma.userBadgeAward.findUnique({ where: { id: awardId } });
    if (!existing) return NextResponse.json({ success: false, error: "勋章授予记录不存在" }, { status: 404 });
    await prisma.userBadgeAward.delete({ where: { id: awardId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
