import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/me/task-chains/[id] - Update task chain (archive, complete, update context)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, lastActiveTool, context, linkedDraftHints } = body;

    // Verify ownership
    const existing = await prisma.taskChainDraft.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task chain not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (status && ["active", "archived", "completed", "deleted"].includes(status)) {
      updateData.status = status;
      if (status === "archived") updateData.archivedAt = new Date();
      if (status === "completed") updateData.completedAt = new Date();
      if (status === "deleted") updateData.deletedAt = new Date();
    }

    if (lastActiveTool !== undefined) {
      updateData.lastActiveTool = lastActiveTool;
    }

    if (context !== undefined && typeof context === "object") {
      updateData.context = context;
    }

    if (linkedDraftHints !== undefined) {
      updateData.linkedDraftHints = linkedDraftHints;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    const updated = await prisma.taskChainDraft.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/me/task-chains/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task chain" }, { status: 500 });
  }
}

// DELETE /api/me/task-chains/[id] - Soft delete task chain
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.taskChainDraft.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Task chain not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.taskChainDraft.update({
      where: { id },
      data: {
        status: "deleted",
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task chain deleted",
    });
  } catch (error) {
    console.error("DELETE /api/me/task-chains/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task chain" }, { status: 500 });
  }
}
