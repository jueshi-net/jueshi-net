// POST /api/me/tool-documents/[id]/restore — restore from history version
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

  // Verify document ownership
  const draft = await prisma.toolDocumentDraft.findFirst({
    where: { id, userId },
  });
  if (!draft) return NextResponse.json({ error: "文档不存在或无权访问" }, { status: 404 });

  // Get history entry
  const history = await prisma.toolDocumentHistory.findFirst({
    where: { id: historyId, documentId: id },
  });
  if (!history) return NextResponse.json({ error: "历史版本不存在" }, { status: 404 });

  // Restore: set dataJson from history snapshot
  const restored = await prisma.toolDocumentDraft.update({
    where: { id },
    data: { dataJson: history.snapshotJson },
  });

  // Write restore history (does NOT overwrite current — user must click save to finalize)
  await prisma.toolDocumentHistory.create({
    data: {
      userId,
      documentId: id,
      snapshotJson: JSON.stringify(restored),
      action: "restore",
    },
  });

  return NextResponse.json({ success: true, data: restored, message: "已恢复到历史版本，点击「保存」确认" });
}
