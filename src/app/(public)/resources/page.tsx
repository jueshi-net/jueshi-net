import { prisma } from "@/lib/prisma";
import ResourceDirectoryClient from "./resource-directory-client";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * Featured resources are identified by sortOrder < 0.
 * This is the "方案 A" from v1.20.42.6.97 — no schema change needed.
 * 
 * Admin can set sortOrder to a negative value (e.g. -1, -2, -3)
 * to mark a resource as featured. Lower values = higher priority.
 * 
 * Fallback: if no featured resources exist, show top qualityScore resources.
 */
export default async function ResourceDirectoryPage() {
  // 读取所有活跃网址（常规排序）
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    orderBy: [
      { isAd: "desc" }, // 广告优先
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  // 读取推荐位资源：sortOrder < 0 表示推荐
  // 排除广告资源（广告有独立展示区）
  let featuredResources = await prisma.resource.findMany({
    where: {
      isActive: true,
      isAd: false,
      sortOrder: { lt: 0 },
    },
    orderBy: [
      { sortOrder: "asc" }, // 更小的值（更负）排在前面
    ],
    take: 12, // 最多展示 12 个推荐位
  });

  // Fallback: 如果没有推荐位资源，使用高质量资源作为 fallback
  if (featuredResources.length === 0) {
    featuredResources = await prisma.resource.findMany({
      where: {
        isActive: true,
        isAd: false,
        qualityScore: { gte: 70 },
      },
      orderBy: [
        { qualityScore: "desc" },
        { createdAt: "desc" },
      ],
      take: 6,
    });
  }

  return (
    <ResourceDirectoryClient
      resources={resources}
      featuredResources={featuredResources}
    />
  );
}
