import type { Metadata } from "next";
import { buildCanonical, buildTitle } from "@/lib/seo";
import TranslatePolishClient from "./translate-polish-client";

export const metadata: Metadata = {
  title: buildTitle("AI 翻译润色"),
  description: "面向邮件、商品文案、学习材料和商务文本的翻译与润色工具，帮助海外沟通表达更自然、更清晰。",
  alternates: { canonical: buildCanonical("/ai-tools/translate-polish") },
  openGraph: {
    title: buildTitle("AI 翻译润色"),
    description: "面向邮件、商品文案、学习材料和商务文本的翻译与润色工具，帮助海外沟通表达更自然、更清晰。",
    url: buildCanonical("/ai-tools/translate-polish"),
  },
};

export default function TranslatePolishPage() {
  return <TranslatePolishClient />;
}
