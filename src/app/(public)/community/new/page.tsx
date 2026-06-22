import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NewPostClient } from "./new-post-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "发帖 - 社区 - 绝世百宝箱" };

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/community/new");

  const categories = await prisma.forumCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const { category } = await searchParams;

  return <NewPostClient categories={categories.map(c => ({ id: c.id, name: c.name, key: c.key, iconText: c.iconText }))} defaultCategoryId={category || ""} />;
}
