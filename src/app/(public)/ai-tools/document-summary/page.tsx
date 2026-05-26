import { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import DocumentSummaryClient from "./document-summary-client";

export const metadata: Metadata = {
  title: buildTitle("AI 文件摘要助手"),
  description: "帮助快速整理合同、通知、说明文档和长文本的中文摘要、重点条款与风险提醒，适合留学生、海外华人和出海团队。",
  alternates: { canonical: buildCanonical("/ai-tools/document-summary") },
  openGraph: {
    title: buildTitle("AI 文件摘要助手"),
    description: "帮助快速整理合同、通知、说明文档和长文本的中文摘要、重点条款与风险提醒，适合留学生、海外华人和出海团队。",
    url: buildCanonical("/ai-tools/document-summary"),
  },
};

export default function DocumentSummaryPage() {
  return <DocumentSummaryClient />;
}
