import { prisma } from "@/lib/prisma";
import ResourceDirectoryClient from "./resource-directory-client";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "https://jueshi.net/resources" },
};

/**
 * Featured resources use the isFeatured field with optional time-based scheduling.
 * v1.20.42.13.3: Full productization of featured slots.
 * 
 * Admin can set isFeatured=true with optional:
 * - featuredGroup: group name for categorization
 * - featuredOrder: sort order within group
 * - featuredStartAt/featuredEndAt: time-based scheduling
 * 
 * Fallback: if no featured resources exist, show top qualityScore resources.
 */
export default async function ResourceDirectoryPage() {
  const now = new Date();

  // 读取所有活跃网址（常规排序）
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    orderBy: [
      { isAd: "desc" }, // 广告优先
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  // 读取推荐位资源：isFeatured=true 且在有效期内
  // 排除广告资源（广告有独立展示区）
  let featuredResources = await prisma.resource.findMany({
    where: {
      isActive: true,
      isAd: false,
      isFeatured: true,
      OR: [
        { featuredStartAt: null, featuredEndAt: null }, // 无时间限制
        { featuredStartAt: { lte: now }, featuredEndAt: null }, // 已开始，无结束
        { featuredStartAt: null, featuredEndAt: { gte: now } }, // 未开始，有结束
        { featuredStartAt: { lte: now }, featuredEndAt: { gte: now } }, // 在有效期内
      ],
    },
    orderBy: [
      { featuredOrder: "asc" },
      { qualityScore: "desc" },
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
    <JueshiV4PublicShell>
      <ResourceDirectoryClient
        resources={resources}
        featuredResources={featuredResources}
      />
    </JueshiV4PublicShell>
  );
}
