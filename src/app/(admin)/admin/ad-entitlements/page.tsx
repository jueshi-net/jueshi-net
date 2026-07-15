import { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "广告权益审核 — 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminAdEntitlementsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">广告权益审核</h1>
      <p>广告权益审核页面 - 待实现</p>
    </div>
  );
}
