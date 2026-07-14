import { Metadata } from "next";
import { LayoutGrid } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";
import AdPlacementsClient from "./ad-placements-client";

export const metadata: Metadata = {
  title: "广告位管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminAdPlacementsPage() {
  return (
    <AdminPageFrame
      title="广告位管理"
      description="管理各页面可投放广告的位置"
      icon={<LayoutGrid className="w-5 h-5" />}
      variant="table"
    >
      <AdPlacementsClient />
    </AdminPageFrame>
  );
}
