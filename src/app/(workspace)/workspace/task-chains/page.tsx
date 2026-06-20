import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskChainsClient from "./task-chains-client";

export const metadata: Metadata = {
  title: buildTitle("任务链"),
  description: "管理你的跨境发货任务链，跟踪进度和生成的资料",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workspace/task-chains") },
};

export default async function TaskChainsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/task-chains");
  return <TaskChainsClient />;
}
