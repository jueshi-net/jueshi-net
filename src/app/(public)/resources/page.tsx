import { prisma } from "@/lib/prisma";
import ResourceDirectoryClient from "./resource-directory-client";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function ResourceDirectoryPage() {
  // 读取所有活跃网址
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    orderBy: [
      { isAd: "desc" }, // 广告优先
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return <ResourceDirectoryClient resources={resources} />;
}
