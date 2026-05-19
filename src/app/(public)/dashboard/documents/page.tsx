import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import DocumentsClient from "./documents-client";

export const metadata: Metadata = {
  title: buildTitle("我的单据草稿"),
  description: "查看和管理你保存的所有单据草稿，支持继续编辑、恢复历史和删除。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard/documents") },
};

export default function DocumentsPage() {
  return <DocumentsClient />;
}
