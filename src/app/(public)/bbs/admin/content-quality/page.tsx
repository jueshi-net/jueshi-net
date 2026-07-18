import { auth } from "@/lib/auth";
import { buildTitle } from "@/lib/seo";
import { inspectContentQuality } from "@/lib/community/content-quality";
import type { QualityIssue, QualityIssueType, Severity } from "@/lib/community/content-quality";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";
import { ContentQualityClient } from "@/components/bbs/content-quality-client";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, AlertTriangle, ScanSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: buildTitle("内容质量巡检 - 社区"),
  robots: { index: false, follow: false },
};

export default async function ContentQualityPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) {
    return (
      <JueshiV4PublicShell>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-4 py-2.5">
              <BreadcrumbBar
                items={[
                  { title: "首页", href: "/" },
                  { title: "社区论坛", href: "/bbs" },
                  { title: "内容质量巡检", current: true },
                ]}
              />
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto px-4 py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                需要管理员权限
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                此页面仅对管理员开放
              </p>
              <Link
                href="/bbs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark"
              >
                返回论坛
              </Link>
            </div>
          </div>
        </div>
      </JueshiV4PublicShell>
    );
  }

  // Run content quality inspection (broken_links disabled by default)
  const report = await inspectContentQuality({
    checkBrokenLinks: false,
  });

  // Serialize for client component
  const issues: QualityIssue[] = report.issues;
  const summary = report.summary;

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1200px] mx-auto px-4 py-2.5">
            <BreadcrumbBar
              items={[
                { title: "首页", href: "/" },
                { title: "社区论坛", href: "/bbs" },
                { title: "内容质量巡检", current: true },
              ]}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ScanSearch className="w-6 h-6 text-brand" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                内容质量巡检
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href="/bbs/admin"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">审核管理</span>
              </Link>
              <Link
                href="/bbs/operations"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                运营面板
              </Link>
            </div>
          </div>

          {/* Generated time */}
          <p className="text-xs text-gray-400 mb-4">
            巡检时间：{new Date(report.generatedAt).toLocaleString("zh-CN")}
          </p>

          {/* Client component with issues + filters */}
          <ContentQualityClient issues={issues} summary={summary} />
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
