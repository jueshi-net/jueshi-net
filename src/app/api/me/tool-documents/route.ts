// GET /api/me/tool-documents — list tool document drafts (auth required)
// POST /api/me/tool-documents — create/save tool document draft (auth required)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeDocumentType, documentTypeToHyphen } from "@/lib/documents/document-type-utils";

/** GET — list tool document drafts for current user, optionally filtered by toolKey */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const toolKey = searchParams.get("toolKey") || undefined;

  // Query ToolDocumentDraft table
  const drafts = await prisma.toolDocumentDraft.findMany({
    where: { userId, ...(toolKey ? { toolKey } : {}) },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  // Also query DocumentHistory table and merge results
  // Normalize toolKey for DocumentHistory query (support both hyphen and underscore)
  let historyDocs: any[] = [];
  if (toolKey) {
    const normalizedType = normalizeDocumentType(toolKey);
    const hyphenType = documentTypeToHyphen(toolKey);
    historyDocs = await prisma.documentHistory.findMany({
      where: { 
        userId, 
        documentType: { in: [normalizedType, hyphenType] }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } else {
    // If no toolKey filter, get all DocumentHistory records
    historyDocs = await prisma.documentHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  // Convert DocumentHistory records to match ToolDocumentDraft format
  const historyAsDrafts = historyDocs.map(doc => ({
    id: doc.id,
    userId: doc.userId,
    toolKey: normalizeDocumentType(doc.documentType), // Normalize to underscore
    title: doc.documentNo || `${doc.documentType} - ${new Date(doc.createdAt).toLocaleDateString()}`,
    companyProfileId: null,
    dataJson: doc.documentData,
    previewJson: null,
    createdAt: doc.createdAt,
    updatedAt: doc.createdAt, // DocumentHistory doesn't have updatedAt
  }));

  // Merge and deduplicate by id (prefer ToolDocumentDraft if duplicate)
  const mergedDrafts = [...drafts];
  const draftIds = new Set(drafts.map(d => d.id));
  for (const h of historyAsDrafts) {
    if (!draftIds.has(h.id)) {
      mergedDrafts.push(h);
    }
  }

  // Sort by updatedAt desc
  mergedDrafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json({ success: true, data: mergedDrafts });
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

  // Write EventLog for Document_Save (server-side, reliable)
  // Normalize toolSlug to hyphenated form (e.g. quote_sheet → quote-sheet)
  const eventSlug = toolKey === "quote_sheet" ? "quote-sheet" : toolKey;
  try {
    await prisma.eventLog.create({
      data: {
        eventType: "Document_Save",
        toolName: toolKey,
        action: JSON.stringify({
          type: "Document_Save",
          toolSlug: eventSlug,
          documentId: draft.id,
          source: "document_tool_engine",
        }),
      },
    });
  } catch (err) {
    console.error("[tool-documents POST] EventLog write failed:", err);
    // Don't fail the save if EventLog fails
  }

  return NextResponse.json({ success: true, data: draft }, { status: 201 });
}
