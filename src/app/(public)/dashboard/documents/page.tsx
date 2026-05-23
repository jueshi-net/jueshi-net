import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import { UserNavSidebar } from "@/components/user/UserSidebar";
import DocumentsClientInner from "./documents-client-inner";

export const metadata: Metadata = {
  title: buildTitle("我的单据"),
  description: "查看和管理你保存的所有单据草稿。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard/documents") },
};

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <UserNavSidebar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 lg:ml-0">
        <DocumentsClientInner />
      </div>
    </div>
  );
}
