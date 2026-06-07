import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TasksClient from "./tasks-client";

export const metadata: Metadata = {
  title: buildTitle("待办与任务"),
  description: "成长任务中心：完成日常任务获取成长值和勋章",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workspace/tasks") },
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/tasks");
  return <TasksClient />;
}
