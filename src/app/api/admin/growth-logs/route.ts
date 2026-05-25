// GET /api/admin/growth-logs — list all growth logs with pagination + filter
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!user || !isAdminRole(user.role)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const typeFilter = searchParams.get("type") || "";
  const userFilter = searchParams.get("userId") || "";
  const emailFilter = searchParams.get("email") || "";

  const where: Record<string, unknown> = {};
  if (typeFilter) where.type = typeFilter;
  if (userFilter) where.userId = userFilter;

  // If email filter, first find matching user IDs
  let userIds: string[] | undefined;
  if (emailFilter) {
    const matchingUsers = await prisma.user.findMany({
      where: { email: { contains: emailFilter, mode: "insensitive" } },
      select: { id: true },
    });
    userIds = matchingUsers.map(u => u.id);
    if (userIds.length === 0) {
      return NextResponse.json({ logs: [], pagination: { page, pageSize, total: 0, totalPages: 0 }, users: {} });
    }
    where.userId = { in: userIds };
  }

  const [logs, total] = await Promise.all([
    prisma.growthLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, email: true, name: true, levelKey: true, growthValue: true } } },
    }),
    prisma.growthLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
