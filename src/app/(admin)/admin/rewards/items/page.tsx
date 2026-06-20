import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RewardItemsClient from "./reward-items-client";

export default async function RewardItemsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/rewards/items");
  
  // Check admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  
  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">权限不足</h2>
          <p className="text-red-600">您需要管理员权限才能访问此页面。</p>
        </div>
      </div>
    );
  }

  // Fetch all reward items
  const rewardItems = await prisma.rewardItem.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { userRewards: true },
      },
    },
  });

  // Convert Date objects to strings for client component
  const serializedItems = rewardItems.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return <RewardItemsClient initialItems={serializedItems} />;
}
