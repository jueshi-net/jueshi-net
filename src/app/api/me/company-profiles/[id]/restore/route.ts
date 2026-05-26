// POST /api/me/company-profiles/[id]/restore — restore from history version
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;
  const body = await req.json();
  const { historyId } = body;

  if (!historyId) return NextResponse.json({ error: "需要提供历史版本 ID" }, { status: 400 });

  // Verify profile ownership
  const profile = await prisma.userCompanyProfile.findFirst({
    where: { id, userId },
  });
  if (!profile) return NextResponse.json({ error: "公司资料不存在或无权访问" }, { status: 404 });

  // Get history entry
  const history = await prisma.userCompanyProfileHistory.findFirst({
    where: { id: historyId, profileId: id },
  });
  if (!history) return NextResponse.json({ error: "历史版本不存在" }, { status: 404 });

  const snapshot = JSON.parse(history.snapshotJson);

  // Restore fields (excluding id, userId, createdAt, updatedAt)
  const { id: _id, userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, ...restoreData } = snapshot;

  const restored = await prisma.userCompanyProfile.update({
    where: { id },
    data: restoreData,
  });

  // Write restore history
  await prisma.userCompanyProfileHistory.create({
    data: {
      userId,
      profileId: id,
      snapshotJson: JSON.stringify(restored),
      action: "restore",
    },
  });

  return NextResponse.json({ success: true, data: restored });
}
