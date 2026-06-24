import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/workspace/document-drafts/[id] — fetch a single draft (owned by the current user)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // findFirst with userId guard ensures ownership — never leak another user's draft
    const draft = await prisma.toolDocumentDraft.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!draft) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ draft });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/workspace/document-drafts/[id] — update an existing draft
// Accepts partial fields: title, dataJson, previewJson, companyProfileId
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before mutating
    const existing = await prisma.toolDocumentDraft.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { title, dataJson, previewJson, companyProfileId } = body as {
      title?: string;
      dataJson?: string;
      previewJson?: string | null;
      companyProfileId?: string | null;
    };

    // Validate dataJson (must be a valid JSON string) when provided
    if (dataJson !== undefined) {
      if (typeof dataJson !== "string") {
        return NextResponse.json(
          { error: "dataJson must be a JSON string" },
          { status: 400 }
        );
      }
      try {
        JSON.parse(dataJson);
      } catch {
        return NextResponse.json(
          { error: "dataJson must be valid JSON" },
          { status: 400 }
        );
      }
    }

    // Validate title length when provided
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 2) {
        return NextResponse.json(
          { error: "title must be at least 2 characters" },
          { status: 400 }
        );
      }
      if (title.length > 200) {
        return NextResponse.json(
          { error: "title must be at most 200 characters" },
          { status: 400 }
        );
      }
    }

    // If companyProfileId provided, verify the user owns it
    if (companyProfileId) {
      const cp = await prisma.userCompanyProfile.findFirst({
        where: { id: companyProfileId, userId: session.user.id },
      });
      if (!cp) {
        return NextResponse.json(
          { error: "Company profile not found or not owned by user" },
          { status: 404 }
        );
      }
    }

    // Build a partial update payload from only the provided fields
    const draft = await prisma.toolDocumentDraft.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(dataJson !== undefined && { dataJson }),
        ...(previewJson !== undefined && {
          previewJson: previewJson || null,
        }),
        ...(companyProfileId !== undefined && {
          companyProfileId: companyProfileId || null,
        }),
      },
    });

    // Best-effort: record a history snapshot when the data changed
    if (dataJson !== undefined) {
      try {
        await prisma.toolDocumentHistory.create({
          data: {
            userId: session.user.id,
            documentId: id,
            snapshotJson: dataJson,
            action: "update",
          },
        });
      } catch {
        // History is non-critical — never fail the update because of it
      }
    }

    return NextResponse.json({ draft });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/workspace/document-drafts/[id] — delete a draft
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before deleting
    const draft = await prisma.toolDocumentDraft.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!draft) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Cascade delete will also remove related ToolDocumentHistory rows
    await prisma.toolDocumentDraft.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
