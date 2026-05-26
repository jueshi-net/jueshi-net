import { Metadata } from "next";
import GrowthLogsClient from "./growth-logs-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "成长日志 — 管理后台",
  robots: { index: false, follow: false },
};

// Server Component: fetch initial data for the client
export default async function AdminGrowthLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; email?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 20;
  const typeFilter = params.type || "";
  const emailFilter = params.email || "";

  // Fetch allTypes in parallel for the filter dropdown
  const allTypesPromise = prisma.growthLog.groupBy({
    by: ["type"],
    _count: true,
    orderBy: { _count: { type: "desc" } },
  });

  const where: Record<string, unknown> = {};
  if (typeFilter) where.type = typeFilter;

  let userIds: string[] | undefined;
  if (emailFilter) {
    const matchingUsers = await prisma.user.findMany({
      where: { email: { contains: emailFilter, mode: "insensitive" } },
      select: { id: true },
    });
    userIds = matchingUsers.map(u => u.id);
    if (userIds.length === 0) {
      const allTypes = await allTypesPromise;
      return <GrowthLogsClient initialLogs={[]} initialPagination={{ page, pageSize, total: 0, totalPages: 0 }} initialType={typeFilter} initialEmail={emailFilter} allTypes={allTypes} />;
    }
    where.userId = { in: userIds };
  }

  const [logs, total, allTypes] = await Promise.all([
    prisma.growthLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, email: true, name: true, levelKey: true, growthValue: true } } },
    }),
    prisma.growthLog.count({ where }),
    allTypesPromise,
  ]);

  return (
    <GrowthLogsClient
      initialLogs={logs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() }))}
      initialPagination={{ page, pageSize, total, totalPages: Math.ceil(total / pageSize) }}
      initialType={typeFilter}
      initialEmail={emailFilter}
      allTypes={allTypes}
    />
  );
}
