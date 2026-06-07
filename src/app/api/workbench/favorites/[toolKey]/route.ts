// DELETE /api/workbench/favorites/[toolKey] — unfavorite a tool

import { NextResponse } from "next/server";
import { requireLogin } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ toolKey: string }> }
) {
  const res = await requireLogin();
  if ("error" in res) return res.error;

  const { session } = res;
  const userId = session.user.id;
  const { toolKey } = await params;

  try {
    if (!toolKey || !toolKey.trim()) {
      return NextResponse.json({ error: "toolKey 不能为空" }, { status: 400 });
    }

    // Check ownership and delete
    const deleted = await prisma.toolFavorite.deleteMany({
      where: {
        userId,
        toolKey: toolKey.trim(),
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "收藏不存在" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Workbench Favorites DELETE Error]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
