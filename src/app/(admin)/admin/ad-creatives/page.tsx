import { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";
import AdCreativesClient from "./ad-creatives-client";

export const metadata: Metadata = {
  title: "广告素材管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminAdCreativesPage() {
  return (
    <AdminPageFrame
      title="广告素材管理"
      description="管理各广告活动的素材（图片/HTML/文案/原生）"
      icon={<ImageIcon className="w-5 h-5" />}
      variant="table"
    >
      <AdCreativesClient />
    </AdminPageFrame>
  );
}
