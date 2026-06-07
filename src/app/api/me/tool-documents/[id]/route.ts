// GET /api/me/tool-documents/[id] — get single document draft (auth + userId isolation)
// PUT /api/me/tool-documents/[id] — update document draft (auth + userId isolation)
// DELETE /api/me/tool-documents/[id] — delete document draft (auth + userId isolation)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET — get single tool document draft */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const draft = await prisma.toolDocumentDraft.findFirst({
    where: { id, userId },
  });

  if (!draft) return NextResponse.json({ error: "文档不存在或无权访问" }, { status: 404 });

  return NextResponse.json({ success: true, data: draft });
}

/** PUT — update tool document draft */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  // Verify ownership
  const existing = await prisma.toolDocumentDraft.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ error: "文档不存在或无权访问" }, { status: 404 });

  const body = await req.json();
  const { title, companyProfileId, dataJson, previewJson } = body;

  // Validation
  if (title !== undefined) {
    if (title.length < 2) return NextResponse.json({ error: "标题至少 2 字" }, { status: 400 });
    if (title.length > 200) return NextResponse.json({ error: "标题最多 200 字" }, { status: 400 });
  }
  if (dataJson !== undefined) {
    try { JSON.parse(dataJson); } catch {
      return NextResponse.json({ error: "dataJson 必须是有效的 JSON 字符串" }, { status: 400 });
    }
  }

  // If companyProfileId changed, verify ownership
  if (companyProfileId !== undefined && companyProfileId !== null) {
    const cp = await prisma.userCompanyProfile.findFirst({
      where: { id: companyProfileId, userId },
    });
    if (!cp) return NextResponse.json({ error: "公司资料不存在或无权访问" }, { status: 404 });
  }

  const updated = await prisma.toolDocumentDraft.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(companyProfileId !== undefined && { companyProfileId }),
      ...(dataJson !== undefined && { dataJson }),
      ...(previewJson !== undefined && { previewJson }),
    },
  });

  // Write history
  if (dataJson !== undefined) {
    await prisma.toolDocumentHistory.create({
      data: {
        userId,
        documentId: id,
        snapshotJson: dataJson,
        action: "update",
      },
    });
  }

  return NextResponse.json({ success: true, data: updated });
}

/** DELETE — delete tool document draft */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.toolDocumentDraft.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ error: "文档不存在或无权访问" }, { status: 404 });

  await prisma.toolDocumentDraft.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "文档已删除" });
}
