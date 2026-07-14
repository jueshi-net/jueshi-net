import { Metadata } from "next";
import { Shield } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";
import AdEntitlementsClient from "./ad-entitlements-client";

export const metadata: Metadata = {
  title: "广告权益审核 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminAdEntitlementsPage() {
  return (
    <AdminPageFrame
      title="广告权益审核"
      description="审核用户提交的广告权益申请"
      icon={<Shield className="w-5 h-5" />}
      variant="table"
    >
      <AdEntitlementsClient />
    </AdminPageFrame>
  );
}
