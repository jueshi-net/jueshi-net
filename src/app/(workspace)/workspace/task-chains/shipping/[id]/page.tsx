import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ShippingWorkbench from "./shipping-workbench";

export const metadata: Metadata = {
  title: buildTitle("发货任务工作台"),
  description: "跨境发货10步骤工作台",
  robots: { index: false, follow: false },
};

export default async function ShippingWorkbenchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/task-chains");
  const { id } = await params;
  return <ShippingWorkbench taskId={id} />;
}
