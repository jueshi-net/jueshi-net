// GET /api/me/tool-documents — list tool document drafts (auth required)
// POST /api/me/tool-documents — create/save tool document draft (auth required)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET — list tool document drafts for current user, optionally filtered by toolKey */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const toolKey = searchParams.get("toolKey") || undefined;

  const drafts = await prisma.toolDocumentDraft.findMany({
    where: { userId, ...(toolKey ? { toolKey } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ success: true, data: drafts });
}

/** POST — create or update tool document draft */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json();

  const { toolKey, title, companyProfileId, dataJson, previewJson } = body;

  // Validation
  if (!toolKey) return NextResponse.json({ error: "toolKey 必填" }, { status: 400 });
  if (!title || title.length < 2) return NextResponse.json({ error: "标题至少 2 字" }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: "标题最多 200 字" }, { status: 400 });
  if (!dataJson) return NextResponse.json({ error: "dataJson 必填" }, { status: 400 });

  // If companyProfileId provided, verify ownership
  if (companyProfileId) {
    const cp = await prisma.userCompanyProfile.findFirst({
      where: { id: companyProfileId, userId },
    });
    if (!cp) return NextResponse.json({ error: "公司资料不存在或无权访问" }, { status: 404 });
  }

  // Validate dataJson is valid JSON string
  try { JSON.parse(dataJson); } catch {
    return NextResponse.json({ error: "dataJson 必须是有效的 JSON 字符串" }, { status: 400 });
  }

  const draft = await prisma.toolDocumentDraft.create({
    data: {
      userId,
      toolKey,
      title,
      companyProfileId: companyProfileId || null,
      dataJson,
      previewJson: previewJson || null,
    },
  });

  // Write history
  await prisma.toolDocumentHistory.create({
    data: {
      userId,
      documentId: draft.id,
      snapshotJson: dataJson,
      action: "create",
    },
  });

  return NextResponse.json({ success: true, data: draft }, { status: 201 });
}
