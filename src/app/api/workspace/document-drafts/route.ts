import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - list user's document drafts
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await prisma.toolDocumentDraft.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ drafts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST - create or update a document draft
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { documentType, documentData, companyProfileId } = body;

    if (!documentType || !documentData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if draft exists for this type
    const existing = await prisma.toolDocumentDraft.findFirst({
      where: {
        userId: session.user.id,
        documentType,
      },
    });

    let draft;
    if (existing) {
      // Update existing
      draft = await prisma.toolDocumentDraft.update({
        where: { id: existing.id },
        data: {
          documentData,
          companyProfileId: companyProfileId || null,
          status: "draft",
        },
      });
    } else {
      // Create new
      draft = await prisma.toolDocumentDraft.create({
        data: {
          userId: session.user.id,
          documentType,
          documentData,
          companyProfileId: companyProfileId || null,
          status: "draft",
        },
      });
    }

    return NextResponse.json({ draft });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - delete a document draft
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Verify ownership
    const draft = await prisma.toolDocumentDraft.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!draft) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.toolDocumentDraft.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
