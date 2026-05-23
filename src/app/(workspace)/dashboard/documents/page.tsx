import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import DocumentsClientInner from "./documents-client-inner";

export const metadata: Metadata = {
  title: buildTitle("我的单据"),
  description: "查看和管理你保存的所有单据草稿。",
  robots: { index: false, follow: false },
  alternates: { canonical: buildCanonical("/dashboard/documents") },
};

export default function DocumentsPage() {
  return <DocumentsClientInner />;
}
