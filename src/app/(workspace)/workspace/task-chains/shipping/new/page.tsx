import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ShippingNewClient from "./shipping-new-client";
import WorkspacePageFrame from "@/components/workspace/WorkspacePageFrame";

export const metadata: Metadata = {
  title: buildTitle("新建发货任务"),
  description: "创建跨境发货任务链，10步完成全流程",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/workspace/task-chains/shipping/new") },
};

export default async function ShippingNewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/workspace/task-chains/shipping/new");
  return (
    <WorkspacePageFrame rightRail={null}>
      <ShippingNewClient />
    </WorkspacePageFrame>
  );
}
