import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/workspace/document-drafts/[id]/duplicate
// Creates a copy of the draft with a new id, identical data, and a marked title.
// The toolKey is preserved (it is an enum-like routing key, so it must not be
// suffixed), while the user-visible title gets a " (副本)" suffix to distinguish
// the duplicate from the original.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership and load the source draft
    const source = await prisma.toolDocumentDraft.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!source) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Guard against an excessively long title after appending the suffix
    const suffix = " (副本)";
    const maxTitle = 200;
    const baseTitle = source.title || source.toolKey;
    const copyTitle =
      baseTitle.length + suffix.length > maxTitle
        ? `${baseTitle.slice(0, maxTitle - suffix.length)}${suffix}`
        : `${baseTitle}${suffix}`;

    // Create the duplicate: new id (auto-generated), same toolKey/data, marked title
    const draft = await prisma.toolDocumentDraft.create({
      data: {
        userId: session.user.id,
        toolKey: source.toolKey,
        title: copyTitle,
        companyProfileId: source.companyProfileId,
        dataJson: source.dataJson,
        previewJson: source.previewJson,
      },
    });

    // Best-effort: record a history snapshot for the new copy
    try {
      await prisma.toolDocumentHistory.create({
        data: {
          userId: session.user.id,
          documentId: draft.id,
          snapshotJson: source.dataJson,
          action: "create",
        },
      });
    } catch {
      // History is non-critical — never fail the duplicate because of it
    }

    return NextResponse.json({ draft }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
