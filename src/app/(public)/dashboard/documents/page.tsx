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
      {/* Top bar — breadcrumb hidden on mobile */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600 transition-colors">首页</a>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 font-medium">我的单据</span>
          </div>
          <span className="md:hidden text-sm font-bold text-gray-900 tracking-tight">我的单据</span>
          <div className="w-8" />
        </div>
      </div>
      <UserNavSidebar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5 lg:ml-0">
        <DocumentsClientInner />
      </div>
    </div>
  );
}
