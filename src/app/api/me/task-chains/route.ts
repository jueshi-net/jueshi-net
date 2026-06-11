import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/me/task-chains - Save task chain to workspace
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, sourceTool, lastActiveTool, context, linkedDraftHints } = body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!sourceTool || typeof sourceTool !== "string") {
      return NextResponse.json({ error: "sourceTool is required" }, { status: 400 });
    }
    if (!context || typeof context !== "object") {
      return NextResponse.json({ error: "context must be an object" }, { status: 400 });
    }

    // Check limit (5 for free users, 50 for premium)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });

    const limit = user?.isPremium ? 50 : 5;
    const activeCount = await prisma.taskChainDraft.count({
      where: {
        userId: session.user.id,
        status: "active",
      },
    });

    if (activeCount >= limit) {
      return NextResponse.json(
        {
          error: `Task chain limit reached. You can save up to ${limit} active task chains.`,
          limit,
          current: activeCount,
        },
        { status: 403 }
      );
    }

    // Create task chain
    const taskChain = await prisma.taskChainDraft.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        sourceTool,
        lastActiveTool: lastActiveTool || null,
        context,
        linkedDraftHints: linkedDraftHints || null,
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      data: taskChain,
    });
  } catch (error) {
    console.error("POST /api/me/task-chains error:", error);
    return NextResponse.json({ error: "Failed to save task chain" }, { status: 500 });
  }
}

// GET /api/me/task-chains - List user's task chains
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 50);

    const taskChains = await prisma.taskChainDraft.findMany({
      where: {
        userId: session.user.id,
        status,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: taskChains,
    });
  } catch (error) {
    console.error("GET /api/me/task-chains error:", error);
    return NextResponse.json({ error: "Failed to fetch task chains" }, { status: 500 });
  }
}
