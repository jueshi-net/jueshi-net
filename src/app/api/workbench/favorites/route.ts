// POST /api/workbench/favorites — favorite a tool

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { toolKey } = body;

    if (!toolKey || typeof toolKey !== "string" || !toolKey.trim()) {
      return NextResponse.json({ error: "toolKey 不能为空" }, { status: 400 });
    }

    // Try to create, handle duplicate
    try {
      const favorite = await prisma.toolFavorite.create({
        data: {
          userId,
          toolKey: toolKey.trim(),
        },
      });

      return NextResponse.json({ favorite }, { status: 201 });
    } catch (error: any) {
      if (error.code === "P2002") {
        // Unique constraint violation — already favorited
        return NextResponse.json(
          { error: "已收藏过此工具", code: "ALREADY_FAVORITED" },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[Workbench Favorites POST Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
