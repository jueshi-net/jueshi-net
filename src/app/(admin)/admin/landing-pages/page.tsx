import { Metadata } from "next";
import { LayoutTemplate } from "lucide-react";
import AdminPageFrame from "@/components/templates/AdminPageFrame";
import LandingPagesClient from "./landing-pages-client";

export const metadata: Metadata = {
  title: "落地页管理 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminLandingPagesPage() {
  return (
    <AdminPageFrame
      title="落地页管理"
      description="管理各类落地页配置和内容"
      icon={<LayoutTemplate className="w-5 h-5" />}
      variant="table"
    >
      <LandingPagesClient />
    </AdminPageFrame>
  );
}
